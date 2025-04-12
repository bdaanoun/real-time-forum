import navigateTo from "./main.js";

export default function back() {
  if (!history.state.prev) {
    navigateTo("/");
  } else {
    history.back();
  }
};

