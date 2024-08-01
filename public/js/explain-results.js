function toggleSummary(e) {
  console.log(e);
  const element = e.target;
  const newDataToggle = element.innerText;
  element.innerText = element.dataset.toggle;
  element.dataset.toggle = newDataToggle;
}

