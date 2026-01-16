import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ListenRepeatFacade } from "../../facade/listen-repeat.facade";

@Component({
    selector: "current-sentence-card",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./current-sentence-card.component.html",
})
export class CurrentSentenceCardComponent {
    @Input({ required: true }) vm!: ListenRepeatFacade;
}
