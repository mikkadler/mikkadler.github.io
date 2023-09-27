import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { DeleteCookie, GetCookieValue } from "./cookie.js";

export function ProfileView(){

    const root = document.querySelector('#app');
    root.replaceChildren();
    root.append(basicUserInfo(), XpAmount());
    root.append(basicGraph());
    root.append(logoutButton());
}

function basicUserInfo() {

    const basicUserInfo = document.createElement('div');
    basicUserInfo.innerText = 'Profile';
    basicUserInfo.id = 'basicUserInfo';
    basicUserInfo.className = 'basic-user-info';

    const query = `
    {
        user {
            id
            login
            firstName
            auditRatio
          }
    }
    `
    const drawBasicUserInfo = (data) => {
        const basicUserInfo = document.getElementById("basicUserInfo");
        basicUserInfo.innerText = 
        `Welcome ${data.firstName} / ${data.login}!
        You id in school system is: ${data.id}
        You audit ratio at the moment is ${data.auditRatio.toFixed(2)}`
    }

    queryAPI(query, drawBasicUserInfo);

    return basicUserInfo
}

function XpAmount () {

    const xpa = document.createElement('div');
    xpa.className = 'xp-amount';
    xpa.id = 'xpAmount';
    const rootEvent = 85; // "Div 01" root event id

    const query= `
    {
        user {
          transactions_aggregate(where: {type: {_eq: "xp"}, eventId: {_eq: 85}}) {
            aggregate {
              sum {
                amount
              }
            }
          }
          transactions(limit: 4, where: {type: {_eq: "xp"}}, order_by: {createdAt: desc}) {
            amount
            object {
              name
              type
            }
          }
        }
      }
    `

    const drawXpAmount = (data) => {
        console.log(data);
        const xpa = document.getElementById('xpAmount');
        const xpkb = (data.transactions_aggregate.aggregate.sum.amount / 1000).toFixed(1);

        const project = (index) => {
            if (!data.transactions[index]) return `<li></li>`;
            return `<li>${data.transactions[index].object.type} - ${data.transactions[index].object.name}
            ${(data.transactions[index].amount/1000).toPrecision(3)} kB</li>`;
        };

        xpa.innerHTML =`
        <div>
          <div>${xpkb} kB</div>
        </div>
        <div>
          <div class="activity-border">Latest activity</div>
          <ul>
            ${project(0)}
            ${project(1)}
            ${project(2)}
            ${project(3)}
          </ul>
        </div>
      `;
    }

    queryAPI(query, drawXpAmount);

    return xpa
}

function queryAPI(query, drawFunction) {

    const apiAddress = 'https://01.kood.tech/api/graphql-engine/v1/graphql';
    const token = GetCookieValue("token");

    // dont query anything if no token present
    if (!token) return;

    fetch(apiAddress,{
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
    }).then(response => {
        if (response.ok) {
            return response.json();
        }else {
            console.error('Request to the API failed with status code ' + response.status);
        }
    }).then(data => {
        drawFunction(data.data.user[0]);
    }).catch(err => {
        console.error(err);
    });
}

function basicGraph () {
// Declare the chart dimensions and margins.
const width = 640;
const height = 400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

// Declare the x (horizontal position) scale.
const x = d3.scaleUtc()
    .domain([new Date("2023-01-01"), new Date("2024-01-01")])
    .range([marginLeft, width - marginRight]);

// Declare the y (vertical position) scale.
const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height - marginBottom, marginTop]);

// Create the SVG container.
const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

// Add the x-axis.
svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x));

// Add the y-axis.
svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y));

// Append the SVG element.
//container.append(svg.node());
return svg.node();
}

function logoutButton() {
    const button = document.createElement('button');
    button.innerText = "Logout";
    button.className = "logout";
    button.onclick = (e) => {
        e.preventDefault();
        DeleteCookie("token");
        location.reload();
    }
    return button;
}