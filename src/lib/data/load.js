// Data is imported statically and bundled with the app — code and data stay
// atomically consistent, and no "Loading…" state is needed.
import warming from "../../data/warming.json";
import heat from "../../data/heat.json";
import floods from "../../data/floods.json";
import fire from "../../data/fire.json";

export const appData = {
  warming,
  heat,
  floods,
  fire,
};
