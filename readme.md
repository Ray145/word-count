## word-count

### Summary

- main functionality receives an url and options as parameters to `POST /word-count` and returns a word-count map representing the occurence of the words present in the documents downloaded from the passed in url

e.g. post json body
```json
{
	"url": "https://norvig.com/big.txt",  //passed in url
	"options": {
		"processingType": "stream",       //to stream the download in case of huge files
		"ignorePunctuation": true,        //if to ignore punctuation
		"ignoreNumbers": true,            //if to ignore number
        "sort": "occurences",             //sort by: occurences or key
        "sortDirection": "desc"           //sort direction
	}
}
```

- processing history can be viewed via `GET /history`. It also accepts query parameters to specify if results should be sorted by query date `/history?sort=true&includeWordCounts=true&sortDirection=desc`

### Setup

Adjust component configuration `./config/config.json` (`./config/default.yaml` is taken by swagger) and (if needed) pm2 configuration `./config/pm2-ecosystem.config.js` to your environment

Install dependencies `npm install`

Run via node `export NODE_ENV=config && node app.js` (or `set NODE_ENV=config` if on windows) 
or
Run via pm2 `pm2 start ./config/pm2-ecosystem.config.js` or `npm run pm2`

Note: 
- to use logging in pm2 cluster mode you need to install pm2-intercom via `pm2 install pm2-intercom` - this enables log4js to gather logs across the cluster 
- to see swagger docs go to `{host}:{port}/docs`

For tests run `npm test`
