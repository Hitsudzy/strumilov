const express = require('express');
const app = express();
const port = 3005;
const path = require('path');
const request = require('request');
var rp = require('request-promise');

const   axios   = require('axios'),
        cheerio = require('cheerio'),
        url     = 'https://wildberries.ru/search?text=';

app.use(express.json());

app.post('/api/gethtml', (req, res) => {
    let search = req.body.phrase,
        vendor = req.body.vendorCode,
        result = [];
    
        function requestData() {
            for(let i = 1; i < 11; i++){
                var requestUrl = url + encodeURIComponent(search) + '&page=' + i;
                axios.get(requestUrl)
                    .then(response => {
                        if(findVendorPos(response.data, i)){
                            result.push({phrase: search, position: findVendorPos(response.data, i)});
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
            
            let findVendorPos = (html, pageNumber) => {
                var positionList = [];
                const $ = cheerio.load(html);
                $('.j-card-item').each((i,elem) => {
                    positionList.push ({
                        vendor : $(elem).attr('data-catalogercod1s')
                    });
                });
                for(let j = 0; j < positionList.length; j++){
                    if(positionList[j].vendor === vendor){
                        var vendorPos = j+1;
                    }
                }
                if(vendorPos){
                    vendorPos = (pageNumber-1)*positionList.length + vendorPos;
                    return vendorPos;
                }
            };
        }
    requestData();
    setTimeout(function(){
        if(!(result.length)){
            result.push({phrase: search, position: '-'});
        }
        res.status(200).json(result);
    },3000);
});

app.use(express.static(path.resolve(__dirname, 'client')))

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'index.html'))
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})