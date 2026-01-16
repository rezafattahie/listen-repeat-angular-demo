import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ListenRepeatFacade } from "../../facade/listen-repeat.facade";
import { ListenRepeatSession } from "../../models/timestamped-sentence.model";

@Component({
    selector: "transcript-list",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./transcript-list.component.html",
})
export class TranscriptListComponent {
    @Input({ required: true }) vm!: ListenRepeatFacade;
    @Input({ required: true }) session!: ListenRepeatSession;
}
