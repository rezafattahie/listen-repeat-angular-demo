import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ListenRepeatFacade } from "../../facade/listen-repeat.facade";

@Component({
    selector: "controls-panel",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./controls-panel.component.html",
})
export class ControlsPanelComponent {
    @Input({ required: true }) vm!: ListenRepeatFacade;
    
    resetRatios() {
        // Default ratios (1x duration)
        this.vm.micDelayRatio.set(1);
        this.vm.listenWindowRatio.set(1);
    }
}
