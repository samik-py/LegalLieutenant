function showSummary(e) {
  const element = e.target;
  element.innerText = element.dataset.summary;
}

function hideSummary(e) {
  const element = e.target;
  element.innerText = element.dataset.content;
}

