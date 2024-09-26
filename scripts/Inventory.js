export class Inventory {
  constructor() {
    this.items = [];
    this.inventoryElement = document.getElementById("inventory");
    this.itemDisplay = document.getElementById("item-display");
    this.itemsContainer = document.getElementById("items");
    this.currentItemIndex = 0;
  }

  addItem(item) {
    this.items.push(item);
    this.renderItems();
  }

  renderItems() {
    this.itemsContainer.innerHTML = ""; 

    this.items.forEach((item, index) => {
      const itemElement = document.createElement("div");
      itemElement.className = "inventory-item";
      itemElement.innerText = item.name;
      itemElement.onclick = () => this.selectItem(index);

      this.itemsContainer.appendChild(itemElement);
    });

    if (this.items.length > 0) {
      this.selectItem(this.currentItemIndex);
    }
  }

  selectItem(index) {
    this.currentItemIndex = index;
    const selectedItem = this.items[index];
    document.getElementById("item-name").innerText = selectedItem.name;
    document.getElementById("item-description").innerText = selectedItem.description;
  }

  toggle() {
    if (this.inventoryElement.style.display === "none") {
      this.inventoryElement.style.display = "block";
      this.renderItems();
    } else {
      this.inventoryElement.style.display = "none";
    }
  }
}

