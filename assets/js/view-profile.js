import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
import { DeleteCookie, GetCookieValue } from "./cookie.js";

export function ProfileView(){

    const root = document.querySelector('#app');
    root.replaceChildren();
    root.append(basicUserInfo(), xpAmount(), grades());
    root.append(onlineTestAttempts(), xpOverTime());
    root.append(logoutButton());
}

function basicUserInfo() {

    const basicUserInfo = document.createElement('div');
    basicUserInfo.id = 'basicUserInfo';
    basicUserInfo.className = 'basic-user-info';
    basicUserInfo.title = 'Basic User Information';

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
    const drawBasicUserInfo = (input) => {
        const data = input.user[0];
        const basicUserInfo = document.getElementById("basicUserInfo");
        basicUserInfo.innerText = 
        `Welcome ${data.firstName} / ${data.login}!
        You id in school system is: ${data.id}
        You audit ratio at the moment is ${data.auditRatio.toFixed(2)}`
    }

    queryAPI(query, drawBasicUserInfo);

    return basicUserInfo
}

function xpAmount() {

    const xpa = document.createElement('div');
    xpa.className = 'xp-amount';
    xpa.id = 'xpAmount';
    xpa.title = "Amount of XP";
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

    const drawXpAmount = (input) => {
        const data = input.user[0];
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

function grades() {
    const grades = document.createElement('div');
    grades.className = 'grades';
    grades.id = 'grades';
    grades.title = 'Grades';

    const query = `
    {
        result(where: {type: {_eq: "user_audit"}}) {
          grade
          object{
            name
          }
        }
      }
    `

    const drawGrades = (input) => {
        const data = input.result;
        const grades = document.getElementById('grades');
        const tableHeader = document.createElement('div');
        tableHeader.innerHTML = `<div class="table-row">
            <div class="cell-1 table-cell table-header">Task name</div>
            <div class="table-cell table-header">Grade</div>
        </div>`
        grades.append(tableHeader);

        data.forEach(element => {
            const tableRow = document.createElement('div');
            tableRow.className = "table-row";
            const cell_1 = document.createElement('div');
            cell_1.className = "cell-1 table-cell";
            const cell_2 = document.createElement('div');
            cell_2.className = "table-cell";

            cell_1.innerText = `${element.object.name}`;
            cell_2.innerText = `${element.grade.toPrecision(3)}`;

            tableRow.append(cell_1, cell_2);
            grades.appendChild(tableRow);
        });
    };

    queryAPI(query, drawGrades);

    return grades
}

function onlineTestAttempts() {
    const ota = document.createElement('div');
    ota.id = "onlineTestAttempts";
    ota.className = "online-test-attempts";
    ota.title = "Online Test Attempts";

    const query = `
    {
        result(where: {object: {name: {_eq: "Online test"}} }) {
          attrs
        }
      }
    `
    
    const drawOta = (input) => {
        const ota = document.getElementById("onlineTestAttempts");
        const data = input.result[0].attrs.games[1];
        const results = data.results;

        const plot = Plot.plot({
            style: {backgroundColor: "inherit"},
            marks: [
                Plot.barY(results, {x: "level", y: "attempts", fill: "steelblue", tip: true}),
                Plot.ruleY([0])
            ]
        })
        ota.append(plot);
    };

    queryAPI(query, drawOta);

    return ota;
}

function xpOverTime() {
    const xot = document.createElement('div');
    xot.className = 'xp-over-time';
    xot.id = 'xpOverTime';
    xot.title = 'XP over time';
    
    const query = `{
        user {
          transactions(
            where: {type: {_eq: "xp"}, eventId: {_eq: 85}}
            order_by: {createdAt: asc}
          ) {
            amount
            createdAt
            object {
              name
            }
          }
        }
      }`

    const drawXPOverTime = (input) => {
        const data = input.user[0].transactions;
        console.log(data);
        let maxDate = Date.now();
        data.forEach((value, index) => {
            value.name = value.object.name;
            value.date = Date.parse(value.createdAt);
            value.xpTotal = index > 0 ? data[index - 1].xpTotal + value.amount : value.amount;
        });

        const xot = document.getElementById('xpOverTime');
        const plot =  Plot.plot({
            width: 1200,
            marginLeft: 60,
            style: {backgroundColor: "inherit"},
            y: {grid: true, label: "xp over time in Bytes"},
            x: {type: "utc", domain: [data[0].date, data[data.length - 1].date], grid: true},
            marks: [
                Plot.lineY(data, {x: "date", y: "xpTotal", stroke: "steelblue", tip: true}),
                //Plot.dot(data, {x: "date", y1: "name", fill: "black"}),
                Plot.frame()
            ]
        })
        xot.append(plot);
    };

    queryAPI(query, drawXPOverTime);

    return xot
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
        drawFunction(data.data);
    }).catch(err => {
        console.error(err);
    });
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