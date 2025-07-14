package main

import (
	"fmt"
	"log"
	"os"
	"sort"

	"github.com/natrimmer/gnat/tools/internal/config"
	"github.com/natrimmer/gnat/tools/internal/feeds"
)

func main() {
	inputFile := "blogroll.txt"
	outputFile := "data/blogroll.yaml"

	if len(os.Args) > 1 {
		inputFile = os.Args[1]
	}
	if len(os.Args) > 2 {
		outputFile = os.Args[2]
	}

	urls, err := config.ReadURLs(inputFile)
	if err != nil {
		log.Printf("Error reading URLs from %s: %v", inputFile, err)
		return
	}

	var allPosts []feeds.Post

	for _, feedURL := range urls {
		posts, err := feeds.FetchAndParse(feedURL, 3)
		if err != nil {
			log.Printf("Error processing %s: %v", feedURL, err)
			continue
		}
		allPosts = append(allPosts, posts...)
	}

	sort.Slice(allPosts, func(i, j int) bool {
		return allPosts[i].PubDate.After(allPosts[j].PubDate)
	})

	err = writeYAML(allPosts, outputFile)
	if err != nil {
		log.Printf("Error writing YAML to %s: %v", outputFile, err)
		return
	}

	fmt.Printf("Generated blogroll with %d posts to %s\n", len(allPosts), outputFile)
}

func writeYAML(posts []feeds.Post, filename string) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer func() {
		if closeErr := file.Close(); closeErr != nil {
			log.Printf("Error closing file %s: %v", filename, closeErr)
		}
	}()

	for _, post := range posts {
		if _, err := fmt.Fprintf(file, "- title: %q\n", post.Title); err != nil {
			return err
		}
		if _, err := fmt.Fprintf(file, "  url: %q\n", post.URL); err != nil {
			return err
		}
		if _, err := fmt.Fprintf(file, "  date: %q\n", post.Date); err != nil {
			return err
		}
		if _, err := fmt.Fprintf(file, "  domain: %q\n", post.Domain); err != nil {
			return err
		}
		if _, err := fmt.Fprintf(file, "  feed_url: %q\n", post.FeedURL); err != nil {
			return err
		}
	}

	return nil
}
