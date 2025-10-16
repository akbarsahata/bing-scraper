# CSV Template for Bing Scraper

This template file provides an example of how to format your CSV file for the Bing Scraper application.

## Format

The CSV file should have a single column with the header `keyword`. Each row after the header should contain one search query/keyword that you want to scrape from Bing.

## Example Structure

```csv
keyword
your first search query
your second search query
your third search query
```

## Guidelines

1. **Header Required**: The first row must be `keyword`
2. **One Query Per Row**: Each subsequent row should contain a single search query
3. **No Empty Rows**: Remove any empty rows from your CSV
4. **Plain Text**: Keep queries as plain text, avoid special formatting
5. **File Size**: Keep file size under 10MB
6. **Encoding**: Use UTF-8 encoding for best compatibility

## Tips

- Be specific with your keywords for better results
- You can include long-tail search queries
- Include location-specific queries if needed (e.g., "pizza near Times Square")
- Natural language queries work well (e.g., "how to learn Python")

## Need Help?

If you encounter any issues uploading your CSV file, please check:
- The file has the correct header (`keyword`)
- The file is in CSV format (`.csv`)
- The file size is under 10MB
- There are no empty rows between keywords
