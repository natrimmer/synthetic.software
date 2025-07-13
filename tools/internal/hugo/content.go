package hugo

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
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

func CreateFeedFile(item FeedItem, destDir string) error {
	dateDir := filepath.Join(destDir,
		fmt.Sprintf("%04d", item.Date.Year()),
		fmt.Sprintf("%02d", item.Date.Month()),
		fmt.Sprintf("%02d", item.Date.Day()))

	err := os.MkdirAll(dateDir, 0755)
	if err != nil {
		return err
	}

	err = createIndexFiles(destDir, item.Date)
	if err != nil {
		return err
	}

	filename := filepath.Join(dateDir, fmt.Sprintf("%d.md", item.ID))
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer func() {
		if closeErr := file.Close(); closeErr != nil {
			log.Printf("Error closing file %s: %v", filename, closeErr)
		}
	}()

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

	_, err = file.WriteString(item.Content)
	return err
}

func GetNextID(destDir string) (int, error) {
	maxID := 0

	err := filepath.WalkDir(destDir, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			if os.IsNotExist(err) {
				return nil
			}
			return err
		}

		if d.IsDir() || !strings.HasSuffix(path, ".md") {
			return nil
		}

		basename := strings.TrimSuffix(filepath.Base(path), ".md")
		if id := parseID(basename); id > maxID {
			maxID = id
		}

		return nil
	})

	if err != nil && !os.IsNotExist(err) {
		return 0, err
	}

	return maxID + 1, nil
}

func parseID(basename string) int {
	var id int
	if _, err := fmt.Sscanf(basename, "%d", &id); err != nil {
		return 0 // Return 0 if parsing fails
	}
	return id
}

func createIndexFiles(destDir string, date time.Time) error {
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
