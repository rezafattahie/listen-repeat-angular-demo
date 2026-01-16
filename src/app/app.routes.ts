import { Routes } from "@angular/router";
import { ListenRepeatPage } from "./listen-repeat/pages/listen-repeat-page/listen-repeat-page";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "listen-repeat" },
  { path: "listen-repeat", component: ListenRepeatPage },
];