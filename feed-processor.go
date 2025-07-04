package main

import (
	"bufio"
	"fmt"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
)

type FeedItem struct {
	ID       int
	Content  string
	Tags     []string
	Date     time.Time
	FilePath string
}

type Config struct {
	SourceDir string
	DestDir   string
	Verbose   bool
}

func main() {
	config := parseArgs()

	if config.Verbose {
		log.Printf("Processing files from %s to %s", config.SourceDir, config.DestDir)
	}

	// Get next available ID
	nextID, err := getNextID(config.DestDir)
	if err != nil {
		log.Fatal("Error getting next ID:", err)
	}

	// Process all text files in source directory
	files, err := findTextFiles(config.SourceDir)
	if err != nil {
		log.Fatal("Error finding files:", err)
	}

	if len(files) == 0 {
		if config.Verbose {
			log.Println("No files to process")
		}
		return
	}

	// Sort files by modification time (oldest first for consistent ID assignment)
	sort.Slice(files, func(i, j int) bool {
		return files[i].Date.Before(files[j].Date)
	})

	processed := 0
	for _, item := range files {
		item.ID = nextID
		nextID++

		err := createFeedFile(item, config.DestDir)
		if err != nil {
			log.Printf("Error creating feed file for %s: %v", item.FilePath, err)
			continue
		}

		// Delete original file
		err = os.Remove(item.FilePath)
		if err != nil {
			log.Printf("Error removing original file %s: %v", item.FilePath, err)
		}

		if config.Verbose {
			log.Printf("Processed: %s -> ID %d", filepath.Base(item.FilePath), item.ID)
		}
		processed++
	}

	log.Printf("Successfully processed %d feed items", processed)
}

func parseArgs() Config {
	if len(os.Args) < 3 {
		fmt.Fprintf(os.Stderr, "Usage: %s <source-dir> <dest-dir> [--verbose]\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "\nExample: %s ./queue ./content/feed\n", os.Args[0])
		os.Exit(1)
	}

	config := Config{
		SourceDir: os.Args[1],
		DestDir:   os.Args[2],
		Verbose:   false,
	}

	for _, arg := range os.Args[3:] {
		if arg == "--verbose" || arg == "-v" {
			config.Verbose = true
		}
	}

	return config
}

func findTextFiles(sourceDir string) ([]FeedItem, error) {
	var items []FeedItem

	err := filepath.WalkDir(sourceDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		// Process .txt files and files without extension
		ext := filepath.Ext(path)
		if ext != ".txt" && ext != "" {
			return nil
		}

		info, err := d.Info()
		if err != nil {
			return err
		}

		content, tags, err := parseFile(path)
		if err != nil {
			log.Printf("Error parsing file %s: %v", path, err)
			return nil // Continue processing other files
		}

		item := FeedItem{
			Content:  content,
			Tags:     tags,
			Date:     info.ModTime(),
			FilePath: path,
		}

		items = append(items, item)
		return nil
	})

	return items, err
}

func parseFile(filePath string) (content string, tags []string, err error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", nil, err
	}
	defer func() {
		if err := file.Close(); err != nil {
			log.Printf("Error closing file %s: %v", filePath, err)
		}
	}()

	var lines []string
	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line != "" {
			lines = append(lines, line)
		}
	}

	if err := scanner.Err(); err != nil {
		return "", nil, err
	}

	if len(lines) == 0 {
		return "", nil, fmt.Errorf("empty file")
	}

	// Join all lines as content
	content = strings.Join(lines, "\n\n")

	// Extract hashtags from content
	tagRegex := regexp.MustCompile(`#(\w+)`)
	matches := tagRegex.FindAllStringSubmatch(content, -1)

	tagSet := make(map[string]bool)
	for _, match := range matches {
		if len(match) > 1 {
			tagSet[strings.ToLower(match[1])] = true
		}
	}

	// Remove hashtags from content since they're going in frontmatter
	content = tagRegex.ReplaceAllString(content, "")

	// Clean up extra whitespace created by tag removal
	// Replace multiple spaces with single space
	content = regexp.MustCompile(`\s+`).ReplaceAllString(content, " ")
	// Trim leading/trailing whitespace
	content = strings.TrimSpace(content)
	// Fix paragraph spacing - restore proper line breaks
	content = strings.ReplaceAll(content, "\n\n", "\n")
	lines = strings.Split(content, "\n")
	var cleanLines []string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line != "" {
			cleanLines = append(cleanLines, line)
		}
	}
	content = strings.Join(cleanLines, "\n\n")

	// Convert map to slice
	for tag := range tagSet {
		tags = append(tags, tag)
	}
	sort.Strings(tags)

	// Also check filename for tags (if filename contains words separated by - or _)
	basename := strings.TrimSuffix(filepath.Base(filePath), filepath.Ext(filePath))
	filenameWords := regexp.MustCompile(`[-_]+`).Split(basename, -1)
	for _, word := range filenameWords {
		word = strings.ToLower(strings.TrimSpace(word))
		if word != "" && len(word) > 2 && !tagSet[word] {
			// Add as tag if it looks like a meaningful word
			if regexp.MustCompile(`^[a-z]+$`).MatchString(word) {
				tags = append(tags, word)
			}
		}
	}

	return content, tags, nil
}

func getNextID(destDir string) (int, error) {
	maxID := 0

	err := filepath.WalkDir(destDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			// If destination doesn't exist yet, that's okay
			if os.IsNotExist(err) {
				return nil
			}
			return err
		}

		if d.IsDir() {
			return nil
		}

		if !strings.HasSuffix(path, ".md") {
			return nil
		}

		// Extract ID from filename
		basename := strings.TrimSuffix(filepath.Base(path), ".md")
		if id, err := strconv.Atoi(basename); err == nil {
			if id > maxID {
				maxID = id
			}
		}

		return nil
	})

	if err != nil && !os.IsNotExist(err) {
		return 0, err
	}

	return maxID + 1, nil
}

func createFeedFile(item FeedItem, destDir string) error {
	// Create directory structure: destDir/YYYY/MM/DD/
	dateDir := filepath.Join(destDir,
		fmt.Sprintf("%04d", item.Date.Year()),
		fmt.Sprintf("%02d", item.Date.Month()),
		fmt.Sprintf("%02d", item.Date.Day()))

	err := os.MkdirAll(dateDir, 0755)
	if err != nil {
		return err
	}

	// Create _index.md files for each level if they don't exist
	err = createIndexFiles(destDir, item.Date)
	if err != nil {
		return err
	}

	// Create the feed item file
	filename := filepath.Join(dateDir, fmt.Sprintf("%d.md", item.ID))

	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer func() {
		if err := file.Close(); err != nil {
			log.Printf("Error closing file %s: %v", filename, err)
		}
	}()

	// Write front matter
	_, err = file.WriteString("---\n")
	if err != nil {
		return err
	}

	_, err = fmt.Fprintf(file, "title: \"#%d\"\n", item.ID)
	if err != nil {
		return err
	}

	_, err = fmt.Fprintf(file, "date: \"%s\"\n", item.Date.Format(time.RFC3339))
	if err != nil {
		return err
	}

	_, err = file.WriteString("type: \"feed\"\n")
	if err != nil {
		return err
	}

	_, err = fmt.Fprintf(file, "url: \"/feed/%d/\"\n", item.ID)
	if err != nil {
		return err
	}

	if len(item.Tags) > 0 {
		_, err = file.WriteString("tags:\n")
		if err != nil {
			return err
		}
		for _, tag := range item.Tags {
			_, err = fmt.Fprintf(file, "  - \"%s\"\n", tag)
			if err != nil {
				return err
			}
		}
	}

	_, err = file.WriteString("---\n\n")
	if err != nil {
		return err
	}

	// Write content
	_, err = file.WriteString(item.Content)
	if err != nil {
		return err
	}

	return nil
}

func createIndexFiles(destDir string, date time.Time) error {
	// Create year index
	yearDir := filepath.Join(destDir, fmt.Sprintf("%04d", date.Year()))
	yearIndex := filepath.Join(yearDir, "_index.md")
	if _, err := os.Stat(yearIndex); os.IsNotExist(err) {
		err = os.MkdirAll(yearDir, 0755)
		if err != nil {
			return err
		}

		content := fmt.Sprintf(`---
title: "%d"
type: "feed"
---

`, date.Year())

		err = os.WriteFile(yearIndex, []byte(content), 0644)
		if err != nil {
			return err
		}
	}

	// Create month index
	monthDir := filepath.Join(yearDir, fmt.Sprintf("%02d", date.Month()))
	monthIndex := filepath.Join(monthDir, "_index.md")
	if _, err := os.Stat(monthIndex); os.IsNotExist(err) {
		err = os.MkdirAll(monthDir, 0755)
		if err != nil {
			return err
		}

		content := fmt.Sprintf(`---
title: "%s %d"
type: "feed"
---

`, date.Month().String(), date.Year())

		err = os.WriteFile(monthIndex, []byte(content), 0644)
		if err != nil {
			return err
		}
	}

	// Create day index
	dayDir := filepath.Join(monthDir, fmt.Sprintf("%02d", date.Day()))
	dayIndex := filepath.Join(dayDir, "_index.md")
	if _, err := os.Stat(dayIndex); os.IsNotExist(err) {
		content := fmt.Sprintf(`---
title: "%s %d, %d"
type: "feed"
---

`, date.Month().String(), date.Day(), date.Year())

		err = os.WriteFile(dayIndex, []byte(content), 0644)
		if err != nil {
			return err
		}
	}

	return nil
}
