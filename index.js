const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())

const url = 'https://blogs.fangraphs.com/category/chin-music/'

const get_title = (post) => {
    return post.find('.posttitle').text()
}

const get_date = (post) => {
    return post.find('.postmeta_author').next().text()
}

const get_host = (post) => {
    return post.find('.postmeta_author').text().trim().substring(3)
}

const get_url = (post) => {
    return post.find('a').attr('href')
}

const getDescription = (post) => {
    const text = post.find('.fullpostentry').text().trim().split('\n')
    let index = 0
    let description = ''
    for (let i = 0; i < text.length; i++) {
        if (text[i].includes('As always')) {
            index = i
        }
    }
    for (let i = 0; i < index; i++) {
        description += text[i]
    }
    return description
}

const parseMusic = (post, item) => {
    const text = post.find('.fullpostentry').html().trim().split('\n')
    const musicHtml = text.filter(line => line.includes('Music by'))
    if (item === 'guest') {
        if (typeof(musicHtml[0]) === 'string') {
            cheerioMusic = cheerio.load(musicHtml[0])
            return cheerioMusic.text().substring(9)
        } else {
            return 'No musical guest'
        } 
    } else if (item === 'link') {
        if (typeof(musicHtml[0]) === 'string') {
            cheerioMusic = cheerio.load(musicHtml[0])
            return cheerioMusic('a').attr('href')
        } else {
            return 'No musical link'
        }
    }
}

app.get('/', function (req, res) {
    res.json('This is my webscraper')
})

app.get('/episodes', (req, res) => {
    axios(url)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const articles = []

            $('.post', html).each(function () { //<-- cannot be a function expression
                const title = get_title($(this))
                const date = get_date($(this))
                const host = get_host($(this))
                const url = get_url($(this))
                const musicGuest = parseMusic($(this), 'guest')
                const musicLink = parseMusic($(this), 'link')
                const description = getDescription($(this))
                articles.push({
                    url,
                    title,
                    date,
                    host,
                    musicGuest,
                    musicLink,
                    description
                })
            })
            res.json(articles)
        }).catch(err => console.log(err))

})


app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

