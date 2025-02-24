import "../shared/title.js";

class Counter extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <button>Clicks : ${count}</button>
        `;
        let btn = this.querySelector("button");
        btn.onclick = () => {
            btn.innerHTML = "Clicks : " + ++count;
        };
    }
}

var count = 0;

customElements.define("click-counter", Counter);

export default function Home() {
    return (
    `<c-title />
    <click-counter />`
    )
}