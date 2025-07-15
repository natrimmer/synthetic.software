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
	"strings"

	"github.com/natrimmer/synthetic.software/tools/internal/config"
	"github.com/natrimmer/synthetic.software/tools/internal/hugo"
)

func main() {
	cfg := config.ParseArgs(os.Args, 3, "feed-processor <source-dir> <dest-dir> [--verbose]")

	if cfg.Verbose {
		log.Printf("Processing files from %s to %s", cfg.SourceDir, cfg.DestDir)
	}

	nextID, err := hugo.GetNextID(cfg.DestDir)
	if err != nil {
		log.Fatal("Error getting next ID:", err)
	}

	files, err := findTextFiles(cfg.SourceDir)
	if err != nil {
		log.Fatal("Error finding files:", err)
	}

	if len(files) == 0 {
		if cfg.Verbose {
			log.Println("No files to process")
		}
		return
	}

	sort.Slice(files, func(i, j int) bool {
		return files[i].Date.Before(files[j].Date)
	})

	processed := 0
	for _, item := range files {
		item.ID = nextID
		nextID++

		err := hugo.CreateFeedFile(item, cfg.DestDir)
		if err != nil {
			log.Printf("Error creating feed file for %s: %v", item.FilePath, err)
			continue
		}

		err = os.Remove(item.FilePath)
		if err != nil {
			log.Printf("Error removing original file %s: %v", item.FilePath, err)
		}

		if cfg.Verbose {
			log.Printf("Processed: %s -> ID %d", filepath.Base(item.FilePath), item.ID)
		}
		processed++
	}

	log.Printf("Successfully processed %d feed items", processed)
}

func findTextFiles(sourceDir string) ([]hugo.FeedItem, error) {
	var items []hugo.FeedItem

	err := filepath.WalkDir(sourceDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

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
			return nil
		}

		item := hugo.FeedItem{
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
		if closeErr := file.Close(); closeErr != nil {
			log.Printf("Error closing file %s: %v", filePath, closeErr)
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

	content = strings.Join(lines, "\n\n")

	tagRegex := regexp.MustCompile(`#(\w+)`)
	matches := tagRegex.FindAllStringSubmatch(content, -1)

	tagSet := make(map[string]bool)
	for _, match := range matches {
		if len(match) > 1 {
			tagSet[strings.ToLower(match[1])] = true
		}
	}

	content = tagRegex.ReplaceAllString(content, "")
	content = regexp.MustCompile(`\s+`).ReplaceAllString(content, " ")
	content = strings.TrimSpace(content)
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

	for tag := range tagSet {
		tags = append(tags, tag)
	}
	sort.Strings(tags)

	basename := strings.TrimSuffix(filepath.Base(filePath), filepath.Ext(filePath))
	filenameWords := regexp.MustCompile(`[-_]+`).Split(basename, -1)
	for _, word := range filenameWords {
		word = strings.ToLower(strings.TrimSpace(word))
		if word != "" && len(word) > 2 && !tagSet[word] {
			if regexp.MustCompile(`^[a-z]+$`).MatchString(word) {
				tags = append(tags, word)
			}
		}
	}

	return content, tags, nil
}
