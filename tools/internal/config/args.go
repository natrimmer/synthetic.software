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
	InputFile string
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

	// Parse positional arguments based on what's available
	if len(args) > 1 {
		config.SourceDir = args[1]
		config.InputFile = args[1] // Alias for single input file use case
	}
	if len(args) > 2 {
		config.DestDir = args[2]
	}

	// Parse flags starting from minArgs position
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
