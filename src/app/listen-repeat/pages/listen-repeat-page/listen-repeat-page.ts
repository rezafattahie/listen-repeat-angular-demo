import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ListenRepeatFacade } from "../../../facade/listen-repeat.facade";
import { ControlsPanelComponent } from "../../../components/controls-panel/controls-panel.component";
import { CurrentSentenceCardComponent } from "../../../components/current-sentence-card/current-sentence-card.component";
import { ResultsListComponent } from "../../../components/results-list/results-list.component";
import { TranscriptListComponent } from "../../../components/transcript-list/transcript-list.component";


@Component({
  selector: "listen-repeat",
  standalone: true,
  imports: [
    CommonModule,
    ControlsPanelComponent,
    CurrentSentenceCardComponent,
    TranscriptListComponent,
    ResultsListComponent,
  ],
  templateUrl: "./listen-repeat-page.html",
})
export class ListenRepeatPage implements AfterViewInit {
  @ViewChild("audioEl") audioEl!: ElementRef<HTMLAudioElement>;

  constructor(public vm: ListenRepeatFacade) {
    this.vm.loadSession("/fixtures/sample-session.json");
  }

  ngAfterViewInit() {
    this.vm.attachAudio(this.audioEl.nativeElement);
  }
}
