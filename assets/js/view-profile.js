import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function ProfileView(token){
    const profile = queryProfile(token); 

    const root = document.querySelector('#app');
    root.replaceChildren();
    root.append(profile);
    root.append(basicGraph());
    root.append(logoutButton());
}

function queryProfile(token) {

    if (!token) return;
    const splittedToken = token.split('.');
    const string = atob(splittedToken[1]);
    console.log(string);

    const div = document.createElement('div');
    div.innerText = 'Profile';
    div.id = 'div';

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

    fetch('https://01.kood.tech/api/graphql-engine/v1/graphql',{
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
            console.error('something went wrong');
        }
    }).then(data => {
        const div = document.getElementById('div');
        console.log(data);
        div.innerText = data.data.user[0].id;
    }).catch(err => {
        console.error(err);
    });

    return div
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
        deleteCookie("token");
        location.reload();
    }
    return button;
}

function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
}