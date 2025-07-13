package config

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"
)

type Config struct {
	SourceDir string
	DestDir   string
	Verbose   bool
}

func ParseArgs(args []string, minArgs int, usage string) Config {
	if len(args) < minArgs {
		fmt.Fprintf(os.Stderr, "Usage: %s\n", usage)
		os.Exit(1)
	}

	config := Config{
		Verbose: false,
	}

	if minArgs >= 2 {
		config.SourceDir = args[1]
	}
	if minArgs >= 3 {
		config.DestDir = args[2]
	}

	for _, arg := range args[minArgs:] {
		if arg == "--verbose" || arg == "-v" {
			config.Verbose = true
		}
	}

	return config
}

func ReadURLs(filename string) ([]string, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer func() {
		if closeErr := file.Close(); closeErr != nil {
			log.Printf("Error closing file %s: %v", filename, closeErr)
		}
	}()

	var urls []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line != "" && !strings.HasPrefix(line, "#") {
			urls = append(urls, line)
		}
	}
	return urls, scanner.Err()
}
