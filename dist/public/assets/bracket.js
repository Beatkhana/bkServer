// let url = '/api/tournament/2147483956/bracketTest';

// var data;
// var gMatches = [];

// let intervalIteration = -1;
// createMatches();
// // setInterval(createMatches, 20000);

// function createMatches() {
//     // console.log('update');
//     // console.log(intervalIteration)

//     // document.getElementById('bracket-svg').innerHTML = '<svg id="bracket-svg" class="bracket-svg" width="1985" height="1042" viewBox="0 0 1985 1042">';
//     fetch(url)
//         .then(res => res.json())
//         .then((out) => {
//             generateMatches(out);
//             // console.log(data = out);
//         })
//         .catch(err => { throw err });


//     function generateMatches(data) {
//         // const svgMain = document.getElementById("bracket-svg");
//         const svgMain = document.createElement('svg');
//         svgMain.setAttribute('id', "bracket-svg");
//         // svgMain.setAttribute('width', 1985);
//         // svgMain.setAttribute('height', 1042);
//         // svgMain.setAttribute('viewBox', "0 0 1985 1042");
//         svgMain.classList.add('"bracket-svg"');

//         var matches = {};

//         for (let i = 0; i < data.length; i++) {
//             const element = data[i];
//             // matches
//             if (!matches[element['round']]) {
//                 matches[element['round']] = [];
//             }

//             matches[element['round']].push(element);
//             gMatches.push(element);
//         }

//         // console.log(matches);


//         var singleMatchRound;

//         const winnersMatches = [];
//         const iterator = Object.keys(matches);
//         for (const key of iterator) {
//             if (key >= 0) {
//                 winnersMatches.push(matches[key]);
//             }
//         }

//         const losersMatches = [];
//         for (const key of iterator) {
//             if (key < 0) {
//                 losersMatches.push(matches[key]);
//             }
//         }

//         const height = winnersMatches[0].length * 75 + losersMatches[0].length * 75 + 200;
//         const width = losersMatches.length * 200 + 150;

//         svgMain.setAttribute("viewBox", `0 0 ${width} ${height}`);
//         svgMain.setAttribute("width", width);
//         svgMain.setAttribute("height", height);
//         svgMain.style.minWidth = width + 200 + 'px';

//         // console.log(winnersMatches);
//         // console.log(losersMatches);

//         for (let i = 0; i < Object.keys(matches).length; i++) {
//             const round = matches[i];
//             if (round.length == 1) {
//                 singleMatchRound = i;
//                 break;
//             }
//         }

//         for (let i = 0; i < winnersMatches.length; i++) {
//             const round = matches[i];
//             const gRound = document.createElementNS("http://www.w3.org/2000/svg", "g");
//             gRound.setAttribute("transform", "translate(" + (i * 250 - 100) + ", 30)");
//             // gRound.setAttribute("data-matchId", match['id']);
//             gRound.classList.add('round-' + i);

//             for (let j = 0; j < round.length; j++) {
//                 const match = round[j];
//                 let svgMatch = createSvgMatch(j, match['p1Name'], match['p2Name'], match['p1Avatar'], match['p2Avatar'], match['p1'], match['p2'], i, round, singleMatchRound, match['id'], match['p1Score'], match['p2Score'], match['status']);
//                 gRound.appendChild(svgMatch);
//             }
//             svgMain.appendChild(gRound);
//         }

//         for (let i = 0; i < losersMatches.length; i++) {
//             const round = losersMatches[i];
//             const gRound = document.createElementNS("http://www.w3.org/2000/svg", "g");
//             gRound.setAttribute("transform", "translate(" + (i * 250 - 100) + ", " + (winnersMatches[0].length * 75 + 150) + ")");
//             gRound.classList.add('round-' + i);

//             for (let j = 0; j < round.length; j++) {
//                 const match = round[j];
//                 let svgMatch = createSvgMatch(j, match['p1Name'], match['p2Name'], match['p1Avatar'], match['p2Avatar'], match['p1'], match['p2'], i, round, singleMatchRound, match['id'], match['p1Score'], match['p2Score'], match['status'], true);
//                 gRound.appendChild(svgMatch);
//             }
//             svgMain.appendChild(gRound);
//         }

//         const gLines = document.createElementNS("http://www.w3.org/2000/svg", "g");
//         gLines.classList.add('lines');
//         const gHeaders = document.createElementNS("http://www.w3.org/2000/svg", "g");
//         gHeaders.classList.add('headers');
//         for (let i = 0; i < winnersMatches.length - 1; i++) {
//             const round = matches[i];

//             for (let j = 0; j < round.length; j++) {
//                 var multi = i != 0 ? (75 * (2 ** i)) : 75;
//                 // var startPos = 0.5 * (2 ** i) * 75;
//                 var startPos = round.length != 1 ? 0.5 * (2 ** i) * 75 + 30 : 0.5 * (2 ** singleMatchRound) * 75 + 30;

//                 let curY = (multi * j) + startPos + 10;
//                 let curX = (i * 250 - 100) + 184;

//                 var multi2 = (i + 1) != 0 ? (75 * (2 ** (i + 1))) : 75;
//                 var startPos2 = round.length != 1 ? 0.5 * (2 ** (i + 1)) * 75 + 30 : 0.5 * (2 ** singleMatchRound) * 75 + 30;

//                 let nextY = (multi2 * Math.floor(j / 2)) + startPos2 + 10;
//                 let nextX = ((i + 1) * 250 - 100);

//                 let xDist = nextX - curX;
//                 let yDist = nextY - curY;
//                 let matchLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
//                 matchLine.setAttribute('d', `M${curX} ${curY} l${xDist / 4} 0 l${xDist / 2} ${yDist} l${xDist / 4} 0`);
//                 matchLine.setAttribute('stroke-width', "1px");
//                 matchLine.classList.add("matchLine");
//                 if (intervalIteration > 0) {
//                     matchLine.classList.add('noAnim');
//                 }
//                 gLines.appendChild(matchLine);
//             }

//             const roundLabel = document.createElementNS("http://www.w3.org/2000/svg", "g");
//             roundLabel.setAttribute("transform", "translate(" + (i * 250 - 100) + ", 0)");
//             const labelRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
//             labelRect.setAttribute("width", 184);
//             labelRect.setAttribute("height", 30);
//             labelRect.classList.add('labelBox');
//             labelRect.classList.add('matchPath');
//             if (intervalIteration > 0) {
//                 labelRect.classList.add('noAnim');
//             }
//             roundLabel.appendChild(labelRect);
//             const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
//             labelText.classList.add('labelText');
//             labelText.setAttribute("x", 95);
//             labelText.setAttribute("y", 21);
//             labelText.setAttribute("height", 15);
//             labelText.setAttribute("width", 190);
//             labelText.setAttribute("text-anchor", "middle");
//             labelText.innerHTML = "Round " + (i + 1);
//             roundLabel.appendChild(labelText);
//             gHeaders.appendChild(roundLabel);

//         }

//         for (let i = 0; i < losersMatches.length - 1; i++) {
//             const round = losersMatches[i];

//             for (let j = 0; j < round.length; j++) {
//                 var multi = i != 0 ? (75 * (2 ** Math.floor(i / 2))) : 75;
//                 // var startPos = 0.5 * (2 ** i) * 75;
//                 var startPos = round.length != 1 ? 0.5 * (2 ** Math.floor(i / 2)) * 75 + (winnersMatches[0].length * 75 + 150) : 0.5 * (2 ** (Math.floor(singleMatchRound / 2) + 1)) * 75 + (winnersMatches[0].length * 75 + 150);

//                 let curY = (multi * j) + startPos + 10;
//                 let curX = (i * 250 - 100) + 184;

//                 var multi2 = (i + 1) != 0 ? (75 * (2 ** (Math.floor(i / 2) + 1))) : 75;
//                 var startPos2 = round.length != 1 ? 0.5 * (2 ** (Math.floor(i / 2) + 1)) * 75 + +(winnersMatches[0].length * 75 + 150) : 0.5 * (2 ** (Math.floor(singleMatchRound / 2) + 1)) * 75 + (winnersMatches[0].length * 75 + 150);

//                 let nextY = (multi2 * Math.floor(j / 2)) + startPos2 + 10;
//                 let nextX = ((i + 1) * 250 - 100);

//                 let xDist = nextX - curX;
//                 let yDist = nextY - curY;
//                 let matchLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
//                 if (i % 2 == 1) {
//                     matchLine.setAttribute('d', `M${curX} ${curY} l${xDist / 4} 0 l${xDist / 2} ${yDist} l${xDist / 4} 0`);
//                 } else {
//                     matchLine.setAttribute('d', `M${curX} ${curY} l${xDist} 0`);
//                 }
//                 matchLine.setAttribute('stroke-width', "1px");
//                 matchLine.classList.add("matchLine");
//                 if (intervalIteration > 0) {
//                     matchLine.classList.add('noAnim');
//                 }
//                 gLines.appendChild(matchLine);
//             }

//             const roundLabel = document.createElementNS("http://www.w3.org/2000/svg", "g");
//             roundLabel.setAttribute("transform", "translate(" + (i * 250 - 100) + ", " + (winnersMatches[0].length * 75 + 120) + ")");
//             const labelRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
//             labelRect.setAttribute("width", 184);
//             labelRect.setAttribute("height", 30);
//             labelRect.classList.add('labelBox');
//             labelRect.classList.add('matchPath');
//             if (intervalIteration > 0) {
//                 labelRect.classList.add('noAnim');
//             }
//             roundLabel.appendChild(labelRect);
//             const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
//             labelText.classList.add('labelText');
//             labelText.setAttribute("x", 95);
//             labelText.setAttribute("y", 21);
//             labelText.setAttribute("height", 15);
//             labelText.setAttribute("width", 190);
//             labelText.setAttribute("text-anchor", "middle");
//             labelText.innerHTML = "Losers Round " + (i + 1);
//             roundLabel.appendChild(labelText);
//             gHeaders.appendChild(roundLabel);

//         }
//         svgMain.appendChild(gHeaders);
//         svgMain.appendChild(gLines);

//         document.getElementById('svgContainer').innerHTML = svgMain.outerHTML;
//     }

//     function createSvgMatch(i, p1Name, p2Name, p1Avatar, p2Avatar, p1Id, p2Id, round, roundElem, singleMatchRound, matchId, p1Score, p2Score, status, losers = false) {
//         const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
//         // var multi = 75 + ((round ** 1.57) * 75);
//         var multi = round != 0 ? (75 * (2 ** round)) : 75;
//         var startPos = roundElem.length != 1 ? 0.5 * (2 ** round) * 75 : 0.5 * (2 ** singleMatchRound) * 75;
//         if (losers) {
//             var multi = round != 0 ? (75 * (2 ** Math.floor(round / 2))) : 75;
//             var startPos = roundElem.length != 1 ? 0.5 * (2 ** Math.floor(round / 2)) * 75 : 0.5 * (2 ** (Math.floor(singleMatchRound / 2) + 1)) * 75;
//         }
//         group.setAttribute("transform", "translate(0, " + ((multi * i) + startPos) + ") scale(0.8)");
//         group.setAttribute("data-matchId", matchId);
//         group.classList.add('match-' + i);
//         group.classList.add('match');

//         const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
//         filter.classList.add('dropShadow');
//         filter.setAttribute('x', -5);
//         filter.setAttribute('y', -5);
//         filter.innerHTML = '<feGaussianBlur stdDeviation="6" />';

//         const clip1 = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
//         clip1.setAttribute("id", 'clipPath-' + i + '-1');
//         clip1.innerHTML = ' <circle r="8" cx="25" cy="-2" />';
//         group.appendChild(clip1);

//         const clip2 = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
//         clip2.setAttribute("id", 'clipPath-' + i + '-2');
//         clip2.innerHTML = ' <circle r="8" cx="25" cy="26" />';
//         group.appendChild(clip2);

//         var noAnim = "";
//         if (intervalIteration > 0) {
//             // labelRect.classList.add('noAnim');
//             noAnim = "noAnim";
//         }

//         group.innerHTML += `<path class="blur" d="m 0 12.25 l 0 -12.5 l 15 -15 h 200 l 15 15 l 0 12.5 M 0 12.25 l 0 12.5 l 15 15 h 200 l 15 -15 l 0 -12.5" />\
//         <path class="matchPath ${noAnim}" d="m 0 12.25 l 0 -12.5 l 15 -15 h 200 l 15 15 l 0 12.5 M 0 12.25 l 0 12.5 l 15 15 h 200 l 15 -15 l 0 -12.5" />\
//         <path class="matchPath ${noAnim} matchSplit" d="m 0 12.25 l 230 0" />`;

//         if (p1Name != null) {
//             group.innerHTML += `
//             <image x="17" y="-10"
//                 href="https://cdn.discordapp.com/avatars/${p1Id}/${p1Avatar}.webp?size=32"
//                 class="img" height="16" width="16" clip-path="url(#clipPath-${i}-1)" />
//             <text x="37" y="5" width="147" height="12" class="pName">${p1Name}</text>
//             `;
//         }
//         if (p2Name != null) {
//             group.innerHTML += `
//             <image x="17" y="18"
//                 href="https://cdn.discordapp.com/avatars/${p2Id}/${p2Avatar}.webp?size=32"
//                 class="img" height="16" width="16" clip-path="url(#clipPath-${i}-2)" />
//             <text x="37" y="33" width="147" height="12" class="pName">${p2Name}</text>
//             `;
//         }
//         // console.log(p1Score)
//         if (p1Score != 0 || p2Score != 0) {
//             if (status == 'complete') {
//                 var p1Class = p1Score > p2Score ? 'winner' : 'loser';
//                 var p2Class = p1Score < p2Score ? 'winner' : 'loser';
//             } else {
//                 var p1Class = '';
//                 var p2Class = '';
//             }
//             group.innerHTML += `
//             <text x="180" y="5" width="147" height="12" class="pName ${p1Class}">${p1Score}</text>
//             <text x="180" y="33" width="147" height="12" class="pName ${p2Class}">${p2Score}</text>
//             `;
//         }

//         if (round == 0) {
//             var p1Loser = (i + 1) * 2 - 1;
//             var p2Loser = (i + 1) * 2;
//         } else if (round % 2 == 1) {
//             if (((round + 1) % 3) % 2 == 0) {
//                 var p1Loser = 0;
//                 var x = 16;
//                 for (let k = 0; k < (Math.floor(round / 2) + 1) + 1; k++) {
//                     p1Loser += x;
//                     x /= 2;
//                 }
//                 p1Loser -= i;
//             } else {
//                 var p1Loser = 1;
//                 var x = 16;
//                 for (let k = 0; k < (Math.floor(round / 2) + 1); k++) {
//                     p1Loser += x;
//                     x /= 2;
//                 }
//                 if (i % 2 == 0) {
//                     p1Loser += i + 1;
//                 } else {
//                     p1Loser += i - 1;
//                 }
//             }

//             // var p1Loser = 16 * (Math.floor(round / 2) + 1);
//         }

//         if (p1Name == null && losers && p1Loser != undefined) {
//             group.innerHTML += `
//             <text x="37" y="5" width="147" height="12" class="loserPlaceHolder">Loser of ${p1Loser}</text>
//             `;
//         }

//         if (losers && p2Name == null && p2Loser != undefined) {
//             group.innerHTML += `
//             <text x="37" y="33" width="147" height="12" class="loserPlaceHolder">Loser of ${p2Loser}</text>
//             `;
//         }

//         group.innerHTML += `<text x="3" y="16" width="147" height="12" class="matchLabel">${matchId}</text>`;
//         group.appendChild(filter);
//         return group;
//     }

//     // $('.matchLine').addClass('noAnim');
//     // $('.matchPath').addClass('noAnim');
//     intervalIteration += 1;
// }

const slider = document.querySelector('#svgContainer');
let isDown = false;
let startX;
let scrollLeft;
let startY;
let scrollDown;

slider.addEventListener('mousedown', (e) => {
    isDown = true;
    document.getElementById("bracket-svg").style.cursor = "grabbing";
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    startY = e.pageY - slider.offsetTop;
    scrollLeft = slider.scrollLeft;
    scrollDown = slider.scrollTop;
});
slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('active');
});
slider.addEventListener('mouseup', () => {
    isDown = false;
    document.getElementById("bracket-svg").style.cursor = "grab";
    slider.classList.remove('active');
});
slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX); //scroll-fast
    const y = e.pageY - slider.offsetTop;
    const walk2 = (y - startY);
    slider.scrollLeft = scrollLeft - walk;
    slider.scrollTop = scrollDown - walk2;
    // console.log(walk);
});