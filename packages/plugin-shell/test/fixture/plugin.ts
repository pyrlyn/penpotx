import { greeting } from "./helper.ts";

console.log(greeting);
void import("./helper.ts").then((later) => console.log(later.greeting));
