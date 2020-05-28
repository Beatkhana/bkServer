(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["styles"],{

/***/ "./node_modules/css-loader/dist/cjs.js?!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/dist/cjs.js?!./src/styles.scss":
/*!************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??ref--13-1!./node_modules/postcss-loader/src??embedded!./node_modules/sass-loader/dist/cjs.js??ref--13-3!./src/styles.scss ***!
  \************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
exports = ___CSS_LOADER_API_IMPORT___(true);
// Module
exports.push([module.i, "/* You can add global styles to this file, and also import other style files */\n* {\n  margin: 0;\n}\n@font-face {\n  font-family: \"Leixo\";\n  src: url(\"/assets/fonts/LEIXO-DEMO.ttf\");\n  font-weight: normal;\n  font-style: normal;\n}\n@font-face {\n  font-family: \"TomatoRound\";\n  src: url(\"/assets/fonts/TomatoRoundCondensed.ttf\");\n  font-weight: normal;\n  font-style: normal;\n}\n@font-face {\n  font-family: \"Roboto\";\n  src: url(\"/assets/fonts/Roboto-Regular.ttf\");\n  font-weight: normal;\n  font-style: normal;\n}\nnav {\n  background-color: #202124;\n  padding: 15px 15px;\n  font-family: \"Leixo\";\n  font-weight: 700;\n  border-bottom: 1px solid #c8825a;\n  margin-bottom: 40px;\n}\n.navContainer {\n  display: block;\n  width: 80vw;\n  margin: auto;\n}\n.banner {\n  margin-right: 30px;\n}\nnav div {\n  display: inline-block;\n}\nnav ul {\n  list-style-type: none;\n  margin: 0;\n  padding: 0;\n}\nnav ul li {\n  float: left;\n  height: 50px;\n  margin: auto 0px;\n}\n.navLink {\n  color: rgba(255, 255, 255, 0.5);\n  height: 20px;\n  padding: 15px 15px;\n  font-weight: normal;\n  width: auto;\n  display: inline-block;\n  text-align: center;\n  vertical-align: middle;\n  text-decoration: none;\n  transition: all 400ms;\n}\n.active.navLink {\n  background-color: #2a2a2a;\n  color: #fff;\n}\n.navLink:hover {\n  background-color: #2a2a2a;\n  color: rgba(255, 255, 255, 0.75);\n}\n.navLink.noHover:hover {\n  color: rgba(255, 255, 255, 0.5);\n  background-color: #202124;\n}\n.icon svg {\n  fill: rgba(255, 255, 255, 0.5);\n  width: 30px;\n  height: 30px;\n  transition: fill 400ms;\n}\n.icon:hover svg {\n  fill: rgba(255, 255, 255, 0.75);\n}\nbody {\n  background-color: #0a0a0a;\n}\n/* Main stuff */\n.container {\n  margin: auto;\n}\nnav .container {\n  width: 100%;\n  display: block;\n}\n.grid {\n  display: grid;\n  gap: 4rem;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  --stagger-delay: 70ms;\n}\n@-webkit-keyframes cardEntrance {\n  from {\n    opacity: 0;\n    transform: scale(0.3);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n@keyframes cardEntrance {\n  from {\n    opacity: 0;\n    transform: scale(0.3);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n/* Card */\n.card {\n  display: flex;\n  flex-direction: column;\n  /* justify-content: center; */\n  /* align-items: center; */\n  background: #202124;\n  font-size: 2rem;\n  color: #fff;\n  box-shadow: rgba(3, 8, 20, 0.1) 0px 0.15rem 0.5rem, rgba(2, 8, 20, 0.1) 0px 0.075rem 0.175rem;\n  height: 100%;\n  width: 100%;\n  border-radius: 4px;\n  transition: all 500ms;\n  overflow: hidden;\n  background-size: cover;\n  background-position: center;\n  background-repeat: no-repeat;\n  -webkit-animation: cardEntrance 550ms ease-out;\n          animation: cardEntrance 550ms ease-out;\n  -webkit-animation-fill-mode: backwards;\n          animation-fill-mode: backwards;\n}\n.card img {\n  border: 2px solid #c8825a;\n}\n.card-img-top {\n  width: 99%;\n  /* border: 2px solid rgb(200, 130, 90); */\n  margin-bottom: 15px;\n}\n.card-title {\n  font-family: \"TomatoRound\", sans-serif;\n  font-weight: 500;\n  padding: 10px;\n  color: #fff;\n}\n.card a {\n  text-decoration: none;\n}\n.card-text {\n  font-family: \"Roboto\", sans-serif;\n  font-weight: 500;\n  font-size: 1.2rem;\n  color: #fff;\n  padding: 10px;\n}\n.card-text a {\n  color: #00aac8;\n  text-decoration: none;\n  background-color: transparent;\n}\n.card:not(.noHover):hover {\n  box-shadow: rgba(2, 8, 20, 0.1) 0px 0.35em 1.175em, rgba(2, 8, 20, 0.08) 0px 0.175em 0.5em;\n  transform: scale(1.03);\n}\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  color: white;\n  font-family: \"TomatoRound\" !important;\n  font-weight: 500 !important;\n}\n/* media queries */\n@media (min-width: 576px) {\n  .container {\n    max-width: 550px;\n  }\n}\n@media (min-width: 768px) {\n  .container {\n    max-width: 756px;\n  }\n}\n@media (min-width: 992px) {\n  .container {\n    max-width: 980px;\n  }\n}\n@media screen and (min-width: 1024px) {\n  .container {\n    max-width: 1000px;\n  }\n}\n@media screen and (min-width: 1216px) {\n  .container {\n    max-width: 1202px;\n  }\n}\n@media screen and (min-width: 1408px) {\n  .container {\n    max-width: 1392px;\n  }\n}\nfooter {\n  padding: 3rem 1.5rem 6rem;\n}\nfooter p {\n  text-align: center;\n  color: white;\n  font-family: \"Leixo\", sans-serif;\n}", "",{"version":3,"sources":["/home/dan/webDev/angular1/app/src/styles.scss","styles.scss"],"names":[],"mappings":"AAAA,8EAAA;AAEA;EACI,SAAA;ACAJ;ADGA;EACI,oBAAA;EACA,wCAAA;EACA,mBAAA;EACA,kBAAA;ACAJ;ADGA;EACI,0BAAA;EACA,kDAAA;EACA,mBAAA;EACA,kBAAA;ACDJ;ADIA;EACI,qBAAA;EACA,4CAAA;EACA,mBAAA;EACA,kBAAA;ACFJ;ADKA;EACI,yBAAA;EACA,kBAAA;EACA,oBAAA;EACA,gBAAA;EACA,gCAAA;EACA,mBAAA;ACHJ;ADMA;EACI,cAAA;EACA,WAAA;EACA,YAAA;ACHJ;ADMA;EACI,kBAAA;ACHJ;ADMA;EACI,qBAAA;ACHJ;ADMA;EACI,qBAAA;EACA,SAAA;EACA,UAAA;ACHJ;ADMA;EACI,WAAA;EACA,YAAA;EACA,gBAAA;ACHJ;ADMA;EACI,+BAAA;EACA,YAAA;EACA,kBAAA;EACA,mBAAA;EACA,WAAA;EACA,qBAAA;EACA,kBAAA;EACA,sBAAA;EACA,qBAAA;EACA,qBAAA;ACHJ;ADMA;EACI,yBAAA;EACA,WAAA;ACHJ;ADMA;EACI,yBAAA;EACA,gCAAA;ACHJ;ADMA;EACI,+BAAA;EACA,yBAAA;ACHJ;ADMA;EACI,8BAAA;EACA,WAAA;EACA,YAAA;EACA,sBAAA;ACHJ;ADMA;EACI,+BAAA;ACHJ;ADMA;EACI,yBAAA;ACHJ;ADOA,eAAA;AAEA;EACI,YAAA;ACLJ;ADQA;EACI,WAAA;EACA,cAAA;ACLJ;ADQA;EACI,aAAA;EACA,SAAA;EACA,2DAAA;EACA,qBAAA;ACLJ;ADQA;EACI;IACI,UAAA;IACA,qBAAA;ECLN;EDOE;IACI,UAAA;IACA,mBAAA;ECLN;AACF;ADHA;EACI;IACI,UAAA;IACA,qBAAA;ECLN;EDOE;IACI,UAAA;IACA,mBAAA;ECLN;AACF;ADSA,SAAA;AAEA;EACI,aAAA;EACA,sBAAA;EACA,6BAAA;EACA,yBAAA;EACA,mBAAA;EACA,eAAA;EACA,WAAA;EACA,6FAAA;EACA,YAAA;EACA,WAAA;EACA,kBAAA;EACA,qBAAA;EACA,gBAAA;EACA,sBAAA;EACA,2BAAA;EACA,4BAAA;EACA,8CAAA;UAAA,sCAAA;EACA,sCAAA;UAAA,8BAAA;ACRJ;ADWA;EACI,yBAAA;ACRJ;ADWA;EACI,UAAA;EACA,yCAAA;EACA,mBAAA;ACRJ;ADWA;EACI,sCAAA;EACA,gBAAA;EACA,aAAA;EACA,WAAA;ACRJ;ADWA;EACI,qBAAA;ACRJ;ADWA;EACI,iCAAA;EACA,gBAAA;EACA,iBAAA;EACA,WAAA;EACA,aAAA;ACRJ;ADWA;EACI,cAAA;EACA,qBAAA;EACA,6BAAA;ACRJ;ADWA;EACI,0FAAA;EACA,sBAAA;ACRJ;ADWA;;;;;;EAMI,YAAA;EACA,qCAAA;EACA,2BAAA;ACRJ;ADYA,kBAAA;AAEA;EACI;IACI,gBAAA;ECVN;AACF;ADaA;EACI;IACI,gBAAA;ECXN;AACF;ADcA;EACI;IACI,gBAAA;ECZN;AACF;ADeA;EACI;IACI,iBAAA;ECbN;AACF;ADgBA;EACI;IACI,iBAAA;ECdN;AACF;ADiBA;EACI;IACI,iBAAA;ECfN;AACF;ADkBA;EACI,yBAAA;AChBJ;ADmBA;EACI,kBAAA;EACA,YAAA;EACA,gCAAA;AChBJ","file":"styles.scss","sourcesContent":["/* You can add global styles to this file, and also import other style files */\n\n* {\n    margin: 0;\n}\n\n@font-face {\n    font-family: 'Leixo';\n    src: url('/assets/fonts/LEIXO-DEMO.ttf');\n    font-weight: normal;\n    font-style: normal;\n}\n\n@font-face {\n    font-family: 'TomatoRound';\n    src: url('/assets/fonts/TomatoRoundCondensed.ttf');\n    font-weight: normal;\n    font-style: normal;\n}\n\n@font-face {\n    font-family: 'Roboto';\n    src: url('/assets/fonts/Roboto-Regular.ttf');\n    font-weight: normal;\n    font-style: normal;\n}\n\nnav {\n    background-color: #202124;\n    padding: 15px 15px;\n    font-family: 'Leixo';\n    font-weight: 700;\n    border-bottom: 1px solid rgb(200, 130, 90);\n    margin-bottom: 40px;\n}\n\n.navContainer {\n    display: block;\n    width: 80vw;\n    margin: auto;\n}\n\n.banner {\n    margin-right: 30px;\n}\n\nnav div {\n    display: inline-block;\n}\n\nnav ul {\n    list-style-type: none;\n    margin: 0;\n    padding: 0;\n}\n\nnav ul li {\n    float: left;\n    height: 50px;\n    margin: auto 0px;\n}\n\n.navLink {\n    color: rgba(255, 255, 255, .5);\n    height: 20px;\n    padding: 15px 15px;\n    font-weight: normal;\n    width: auto;\n    display: inline-block;\n    text-align: center;\n    vertical-align: middle;\n    text-decoration: none;\n    transition: all 400ms;\n}\n\n.active.navLink {\n    background-color: #2a2a2a;\n    color: #fff;\n}\n\n.navLink:hover {\n    background-color: #2a2a2a;\n    color: rgba(255, 255, 255, .75);\n}\n\n.navLink.noHover:hover {\n    color: rgba(255, 255, 255, .5);\n    background-color: #202124;\n}\n\n.icon svg {\n    fill: rgba(255, 255, 255, .5);\n    width: 30px;\n    height: 30px;\n    transition: fill 400ms;\n}\n\n.icon:hover svg {\n    fill: rgba(255, 255, 255, .75);\n}\n\nbody {\n    background-color: #0a0a0a;\n}\n\n\n/* Main stuff */\n\n.container {\n    margin: auto;\n}\n\nnav .container {\n    width: 100%;\n    display: block;\n}\n\n.grid {\n    display: grid;\n    gap: 4rem;\n    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n    --stagger-delay: 70ms;\n}\n\n@keyframes cardEntrance {\n    from {\n        opacity: 0;\n        transform: scale(0.3);\n    }\n    to {\n        opacity: 1;\n        transform: scale(1);\n    }\n}\n\n\n/* Card */\n\n.card {\n    display: flex;\n    flex-direction: column;\n    /* justify-content: center; */\n    /* align-items: center; */\n    background: #202124;\n    font-size: 2rem;\n    color: #fff;\n    box-shadow: rgba(3, 8, 20, 0.1) 0px 0.15rem 0.5rem, rgba(2, 8, 20, 0.1) 0px 0.075rem 0.175rem;\n    height: 100%;\n    width: 100%;\n    border-radius: 4px;\n    transition: all 500ms;\n    overflow: hidden;\n    background-size: cover;\n    background-position: center;\n    background-repeat: no-repeat;\n    animation: cardEntrance 550ms ease-out;\n    animation-fill-mode: backwards;\n}\n\n.card img {\n    border: 2px solid rgb(200, 130, 90);\n}\n\n.card-img-top {\n    width: 99%;\n    /* border: 2px solid rgb(200, 130, 90); */\n    margin-bottom: 15px;\n}\n\n.card-title {\n    font-family: 'TomatoRound', sans-serif;\n    font-weight: 500;\n    padding: 10px;\n    color: #fff;\n}\n\n.card a {\n    text-decoration: none;\n}\n\n.card-text {\n    font-family: 'Roboto', sans-serif;\n    font-weight: 500;\n    font-size: 1.2rem;\n    color: #fff;\n    padding: 10px;\n}\n\n.card-text a {\n    color: rgb(0, 170, 200);\n    text-decoration: none;\n    background-color: transparent;\n}\n\n.card:not(.noHover):hover {\n    box-shadow: rgba(2, 8, 20, 0.1) 0px 0.35em 1.175em, rgba(2, 8, 20, 0.08) 0px 0.175em 0.5em;\n    transform: scale(1.03);\n}\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n    color: white;\n    font-family: 'TomatoRound' !important;\n    font-weight: 500 !important;\n}\n\n\n/* media queries */\n\n@media (min-width: 576px) {\n    .container {\n        max-width: 550px;\n    }\n}\n\n@media (min-width: 768px) {\n    .container {\n        max-width: 756px;\n    }\n}\n\n@media (min-width: 992px) {\n    .container {\n        max-width: 980px;\n    }\n}\n\n@media screen and (min-width: 1024px) {\n    .container {\n        max-width: 1000px;\n    }\n}\n\n@media screen and (min-width: 1216px) {\n    .container {\n        max-width: 1202px;\n    }\n}\n\n@media screen and (min-width: 1408px) {\n    .container {\n        max-width: 1392px;\n    }\n}\n\nfooter {\n    padding: 3rem 1.5rem 6rem;\n}\n\nfooter p {\n    text-align: center;\n    color: white;\n    font-family: 'Leixo', sans-serif;\n}","/* You can add global styles to this file, and also import other style files */\n* {\n  margin: 0;\n}\n\n@font-face {\n  font-family: \"Leixo\";\n  src: url(\"/assets/fonts/LEIXO-DEMO.ttf\");\n  font-weight: normal;\n  font-style: normal;\n}\n@font-face {\n  font-family: \"TomatoRound\";\n  src: url(\"/assets/fonts/TomatoRoundCondensed.ttf\");\n  font-weight: normal;\n  font-style: normal;\n}\n@font-face {\n  font-family: \"Roboto\";\n  src: url(\"/assets/fonts/Roboto-Regular.ttf\");\n  font-weight: normal;\n  font-style: normal;\n}\nnav {\n  background-color: #202124;\n  padding: 15px 15px;\n  font-family: \"Leixo\";\n  font-weight: 700;\n  border-bottom: 1px solid #c8825a;\n  margin-bottom: 40px;\n}\n\n.navContainer {\n  display: block;\n  width: 80vw;\n  margin: auto;\n}\n\n.banner {\n  margin-right: 30px;\n}\n\nnav div {\n  display: inline-block;\n}\n\nnav ul {\n  list-style-type: none;\n  margin: 0;\n  padding: 0;\n}\n\nnav ul li {\n  float: left;\n  height: 50px;\n  margin: auto 0px;\n}\n\n.navLink {\n  color: rgba(255, 255, 255, 0.5);\n  height: 20px;\n  padding: 15px 15px;\n  font-weight: normal;\n  width: auto;\n  display: inline-block;\n  text-align: center;\n  vertical-align: middle;\n  text-decoration: none;\n  transition: all 400ms;\n}\n\n.active.navLink {\n  background-color: #2a2a2a;\n  color: #fff;\n}\n\n.navLink:hover {\n  background-color: #2a2a2a;\n  color: rgba(255, 255, 255, 0.75);\n}\n\n.navLink.noHover:hover {\n  color: rgba(255, 255, 255, 0.5);\n  background-color: #202124;\n}\n\n.icon svg {\n  fill: rgba(255, 255, 255, 0.5);\n  width: 30px;\n  height: 30px;\n  transition: fill 400ms;\n}\n\n.icon:hover svg {\n  fill: rgba(255, 255, 255, 0.75);\n}\n\nbody {\n  background-color: #0a0a0a;\n}\n\n/* Main stuff */\n.container {\n  margin: auto;\n}\n\nnav .container {\n  width: 100%;\n  display: block;\n}\n\n.grid {\n  display: grid;\n  gap: 4rem;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  --stagger-delay: 70ms;\n}\n\n@keyframes cardEntrance {\n  from {\n    opacity: 0;\n    transform: scale(0.3);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n/* Card */\n.card {\n  display: flex;\n  flex-direction: column;\n  /* justify-content: center; */\n  /* align-items: center; */\n  background: #202124;\n  font-size: 2rem;\n  color: #fff;\n  box-shadow: rgba(3, 8, 20, 0.1) 0px 0.15rem 0.5rem, rgba(2, 8, 20, 0.1) 0px 0.075rem 0.175rem;\n  height: 100%;\n  width: 100%;\n  border-radius: 4px;\n  transition: all 500ms;\n  overflow: hidden;\n  background-size: cover;\n  background-position: center;\n  background-repeat: no-repeat;\n  animation: cardEntrance 550ms ease-out;\n  animation-fill-mode: backwards;\n}\n\n.card img {\n  border: 2px solid #c8825a;\n}\n\n.card-img-top {\n  width: 99%;\n  /* border: 2px solid rgb(200, 130, 90); */\n  margin-bottom: 15px;\n}\n\n.card-title {\n  font-family: \"TomatoRound\", sans-serif;\n  font-weight: 500;\n  padding: 10px;\n  color: #fff;\n}\n\n.card a {\n  text-decoration: none;\n}\n\n.card-text {\n  font-family: \"Roboto\", sans-serif;\n  font-weight: 500;\n  font-size: 1.2rem;\n  color: #fff;\n  padding: 10px;\n}\n\n.card-text a {\n  color: #00aac8;\n  text-decoration: none;\n  background-color: transparent;\n}\n\n.card:not(.noHover):hover {\n  box-shadow: rgba(2, 8, 20, 0.1) 0px 0.35em 1.175em, rgba(2, 8, 20, 0.08) 0px 0.175em 0.5em;\n  transform: scale(1.03);\n}\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  color: white;\n  font-family: \"TomatoRound\" !important;\n  font-weight: 500 !important;\n}\n\n/* media queries */\n@media (min-width: 576px) {\n  .container {\n    max-width: 550px;\n  }\n}\n@media (min-width: 768px) {\n  .container {\n    max-width: 756px;\n  }\n}\n@media (min-width: 992px) {\n  .container {\n    max-width: 980px;\n  }\n}\n@media screen and (min-width: 1024px) {\n  .container {\n    max-width: 1000px;\n  }\n}\n@media screen and (min-width: 1216px) {\n  .container {\n    max-width: 1202px;\n  }\n}\n@media screen and (min-width: 1408px) {\n  .container {\n    max-width: 1392px;\n  }\n}\nfooter {\n  padding: 3rem 1.5rem 6rem;\n}\n\nfooter p {\n  text-align: center;\n  color: white;\n  font-family: \"Leixo\", sans-serif;\n}"]}]);
// Exports
module.exports = exports;


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : undefined;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && btoa) {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./src/styles.scss":
/*!*************************!*\
  !*** ./src/styles.scss ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(/*! ../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(/*! !../node_modules/css-loader/dist/cjs.js??ref--13-1!../node_modules/postcss-loader/src??embedded!../node_modules/sass-loader/dist/cjs.js??ref--13-3!./styles.scss */ "./node_modules/css-loader/dist/cjs.js?!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/dist/cjs.js?!./src/styles.scss");

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);

var exported = content.locals ? content.locals : {};



module.exports = exported;

/***/ }),

/***/ 3:
/*!*******************************!*\
  !*** multi ./src/styles.scss ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /home/dan/webDev/angular1/app/src/styles.scss */"./src/styles.scss");


/***/ })

},[[3,"runtime"]]]);
//# sourceMappingURL=styles-es2015.js.map