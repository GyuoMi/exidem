import { Sounds } from "../mechanics/Sounds.js";

export class Inventory {
  constructor() {
    this.items = [];
    this.inventoryOpen = false;
    this.inventoryElement = document.getElementById("inventory");
    this.itemsContainer = document.getElementById("items");
    this.itemNameDisplay = document.getElementById("item-name");
    this.itemDescriptionDisplay = document.getElementById("item-description");
  }

  addItem(item) {
    this.items.push(item);
    this.renderItems();
  }

  renderItems() {
    // Clear existing items to avoid duplicates
    this.itemsContainer.innerHTML = '';

    // Render each item as an .inventory-item div
    this.items.forEach((item, index) => {
      const itemElement = document.createElement("div");
      itemElement.classList.add("inventory-item");
      itemElement.textContent = item.name;

      // When clicked, display item details
      itemElement.addEventListener("click", () => {
        this.showItemDetails(item);
      });

      this.itemsContainer.appendChild(itemElement);
    });
  }

  showItemDetails(item) {
    this.itemNameDisplay.textContent = item.name;
    this.itemDescriptionDisplay.textContent = item.description;
  }

  toggle() {
    this.inventoryOpen = !this.inventoryOpen;
    this.inventoryElement.style.display = this.inventoryOpen ? "flex" : "none";
  }
}

