package feeds

import (
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"
)

type Post struct {
	Title   string    `yaml:"title"`
	URL     string    `yaml:"url"`
	Date    string    `yaml:"date"`
	Domain  string    `yaml:"domain"`
	FeedURL string    `yaml:"feed_url"`
	PubDate time.Time `yaml:"-"`
}

type RSSFeed struct {
	XMLName xml.Name `xml:"rss"`
	Channel Channel  `xml:"channel"`
}

type AtomFeed struct {
	XMLName xml.Name    `xml:"feed"`
	Entries []AtomEntry `xml:"entry"`
}

type Channel struct {
	Items []RSSItem `xml:"item"`
}

type RSSItem struct {
	Title   string `xml:"title"`
	Link    string `xml:"link"`
	PubDate string `xml:"pubDate"`
}

type AtomEntry struct {
	Title     AtomText `xml:"title"`
	Link      AtomLink `xml:"link"`
	Published string   `xml:"published"`
	Updated   string   `xml:"updated"`
}

type AtomText struct {
	Value string `xml:",chardata"`
}

type AtomLink struct {
	Href string `xml:"href,attr"`
}

func FetchAndParse(feedURL string, maxPosts int) ([]Post, error) {
	resp, err := http.Get(feedURL)
	if err != nil {
		return nil, err
	}
	defer func() {
		if closeErr := resp.Body.Close(); closeErr != nil {
			log.Printf("Error closing response body for %s: %v", feedURL, closeErr)
		}
	}()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	domain, err := extractDomain(feedURL)
	if err != nil {
		return nil, err
	}

	posts, err := parseRSS(body, domain, feedURL)
	if err != nil {
		posts, err = parseAtom(body, domain, feedURL)
		if err != nil {
			return nil, fmt.Errorf("failed to parse as RSS or Atom: %v", err)
		}
	}

	if len(posts) > maxPosts {
		posts = posts[:maxPosts]
	}

	return posts, nil
}

func parseRSS(data []byte, domain string, feedURL string) ([]Post, error) {
	var feed RSSFeed
	err := xml.Unmarshal(data, &feed)
	if err != nil {
		return nil, err
	}

	var posts []Post
	for _, item := range feed.Channel.Items {
		pubDate, err := parseDate(item.PubDate)
		if err != nil {
			continue
		}

		post := Post{
			Title:   strings.TrimSpace(item.Title),
			URL:     strings.TrimSpace(item.Link),
			Date:    pubDate.Format("2006-01-02"),
			Domain:  domain,
			FeedURL: feedURL,
			PubDate: pubDate,
		}
		posts = append(posts, post)
	}

	sort.Slice(posts, func(i, j int) bool {
		return posts[i].PubDate.After(posts[j].PubDate)
	})

	return posts, nil
}

func parseAtom(data []byte, domain string, feedURL string) ([]Post, error) {
	var feed AtomFeed
	err := xml.Unmarshal(data, &feed)
	if err != nil {
		return nil, err
	}

	var posts []Post
	for _, entry := range feed.Entries {
		dateStr := entry.Published
		if dateStr == "" {
			dateStr = entry.Updated
		}

		pubDate, err := parseDate(dateStr)
		if err != nil {
			continue
		}

		post := Post{
			Title:   strings.TrimSpace(entry.Title.Value),
			URL:     strings.TrimSpace(entry.Link.Href),
			Date:    pubDate.Format("2006-01-02"),
			Domain:  domain,
			FeedURL: feedURL,
			PubDate: pubDate,
		}
		posts = append(posts, post)
	}

	sort.Slice(posts, func(i, j int) bool {
		return posts[i].PubDate.After(posts[j].PubDate)
	})

	return posts, nil
}

func parseDate(dateStr string) (time.Time, error) {
	formats := []string{
		time.RFC1123Z,
		time.RFC1123,
		time.RFC3339,
		time.RFC822Z,
		time.RFC822,
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05",
		"2006-01-02 15:04:05",
		"2006-01-02",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("unable to parse date: %s", dateStr)
}

func extractDomain(feedURL string) (string, error) {
	u, err := url.Parse(feedURL)
	if err != nil {
		return "", err
	}
	return u.Hostname(), nil
}
