import { FirstPersonController } from "firstpersoncontroller/FirstPersonCharacter";

// Documentation → https://docs.needle.tools/scripting

export class ImprovedFirstPersonController extends FirstPersonController {
    
    awake() {
        super.awake();
        
        // Unity Inspectorで設定された値を基準に倍率を適用
        // デフォルト速度を75%に
        this.movementSpeed = this.movementSpeed * 0.75;
        
        // スプリント速度を1.5倍に
        this.sprintSpeed = this.sprintSpeed * 1.5;
        
        // 最大速度も同様に調整
        this.maxSpeed = this.maxSpeed * 0.75;
        this.maxSprintSpeed = this.maxSprintSpeed * 1.5;
    }
}