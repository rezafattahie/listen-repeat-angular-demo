import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ListenRepeatFacade } from "../../facade/listen-repeat.facade";

@Component({
    selector: "results-list",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./results-list.component.html",
})
export class ResultsListComponent {
    @Input({ required: true }) vm!: ListenRepeatFacade;
}
