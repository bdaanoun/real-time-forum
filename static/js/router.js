import navigateTo from "./main.js";

export default function back() {
  if (!history.state) {
    //navigateTo("/");
  } else {
    history.back();
  }
};

