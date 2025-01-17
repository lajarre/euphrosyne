export default function (initData) {
  switch (initData.action) {
    case "change":
      opener.dismissChangeRelatedRunPopup(window, initData.data);
      break;
    case "delete":
      opener.dismissDeleteRelatedRunPopup(window, initData.value);
      break;
    default:
      opener.dismissAddRelatedRunPopup(window, initData.data);
      break;
  }
}
