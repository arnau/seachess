function handleSubscriptionSuccess(submitter) {
  submitter.textContent = "Sent";
  submitter.disabled = true;
  document.querySelector("#bulletin-email").disabled = true;
}

function handleSubsciptionError(form) {
  const errMsg = document.createElement("p");
  errMsg.textContent = "There seems to be an issue. Please try later.";
  errMsg.classList.add("error-message");
  form.append(errMsg);
}

window.addEventListener("load", () => {

  const bulletinForm = document.querySelector("#bulletin-form");

  if (bulletinForm) {
    bulletinForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const submitter = event.submitter;
      const action = submitter.form.action;
      const data = new FormData(submitter.form);

      fetch(url, { method: "POST", body: data })
        .then(_ => handleSubscriptionSuccess(submitter))
        .catch(_ => handleSubscriptionError(submitter.form));
    });
  }
});
