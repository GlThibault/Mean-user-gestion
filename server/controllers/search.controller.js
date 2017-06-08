'use strict';

const express = require('express');
const router = express.Router();
const movieService = require('../services/movie.service');
const PirateBayAPI = require('thepiratebay');
const katAPI = require('../services/katScrapper.service');
const userService = require('../services/user.service');
const uniq = require('uniq');

// Compare et ajoute la variable film vu / non vu

const compare = (a, b) => {
  if (parseInt(a.seeders) < parseInt(b.seeders))
    return 1;
  if (parseInt(a.seeders) > parseInt(b.seeders))
    return -1;
  return 0;
};

//

const unique = (a, b) => {
  if (a.subcategory && a.subcategory.id === '299')
    return 0;
  if (parseInt(a.size) == parseInt(b.size) && a.name === b.name)
    return 0;
  else
    return 1;
};

// Tri par seeder

const mySort = (src1, src2, user) => {
  src2.forEach((element) => src1.push(element), this);
  src1.sort(compare);
  uniq(src1, unique, true);
  userService.moviesViewed(user, src1, () => {});
  return src1;
};

//

// Recherche de film : (kat / Piratebay)

router.post('/', (req, res) => {
  console.log(req.body.page)
  katAPI.search(req.body.searchquery, req.body.page + 1)
    .then(katResults => {
      PirateBayAPI.search(req.body.searchquery, {
          category: 'video',
          page: req.body.page,
          orderBy: 'seeds',
          sortBy: 'desc'
        })
        .then(TPBResults => {
          movieService.imdb(mySort(TPBResults, katResults, req.body.user))
            .then(data => res.send(data));
        })
        .catch(() => movieService.imdb(katResults)
          .then(data => res.send(data)));
    });
});

router.post('/top', (req, res) => {
  katAPI.searchtop()
    .then(katResults => {
      PirateBayAPI.topTorrents(200)
        .then(TPBResults => {
          movieService.imdb(mySort(TPBResults, katResults, req.body.user))
            .then(data => res.send(data));
        })
        .catch(() => movieService.imdb(katResults)
          .then(data => res.send(data)));
    });
});

//

module.exports = router;