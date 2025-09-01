import { 
    Behaviour, 
    serializable, 
    Mathf, 
    isMobileDevice, 
    SyncedTransform, 
    Camera, 
    PlayerState, 
    CharacterController 
} from "@needle-tools/engine";
import { Vector2, Vector3, Object3D, MathUtils } from "three";

export class ImprovedFirstPersonController extends Behaviour {

    @serializable(CharacterController)
    controller?: CharacterController;

    @serializable(Object3D)
    xRotTarget?: Object3D;

    protected yRotTarget?: Object3D;

    @serializable()
    lookSensitivity: number = 1;

    @serializable()
    movementSpeed: number = 50;

    @serializable()
    sprintSpeed: number = 80;

    @serializable()
    maxSpeed: number = 7;

    @serializable()
    maxSprintSpeed: number = 7;

    @serializable()
    jumpSpeed: number = 5;

    @serializable(Vector2)
    xRotClamp: Vector2 = new Vector2(-89, 89);

    @serializable()
    enableTouchInput: boolean = true;

    @serializable()
    enableDesktopInput: boolean = true;

    protected playerState!: PlayerState;
    protected syncedTransform!: SyncedTransform;
    protected mainCamera!: Camera;
    protected isMobile: boolean = false;

    protected x: number = 0;
    protected y: number = 0;
    protected lookInput = new Vector2();
    protected moveInput = new Vector2();
    protected jumpInput = false;
    protected sprintInput = false;

    protected isDragging: boolean = false;
    protected lastPointerPosition = new Vector2();
    protected keydownHandler?: (event: KeyboardEvent) => void;

    awake() {
        this.playerState = this.gameObject.getComponent(PlayerState)!;
        this.syncedTransform = this.gameObject.getComponent(SyncedTransform)!;
        this.mainCamera = this.gameObject.getComponentInChildren(Camera)!;

        if (this.isMultiplayer()) {
            this.playerState.onOwnerChangeEvent.addEventListener(() => this.onOwnerChanged());
        } else {
            this.onOwnerChanged();
        }
    }

    start() {
        this.setCamRotationFromObject();
    }

    private isInitialized = false;
    protected initialize() {
        this.isInitialized = true;
        this.yRotTarget = this.gameObject;
        this.isMobile = isMobileDevice();

        if (this.isMobile) {
            this.lookSensitivity *= 2;
            this.context.domElement.style.userSelect = "none";
            this.context.domElement.style.touchAction = "none";
            this.context.renderer.domElement.style.touchAction = "none";
        }

        const density = window.devicePixelRatio;
        if (density > 1) {
            this.lookSensitivity *= density;
        }
    }

    protected registerInput() {
        if (this.enableDesktopInput) {
            this.context.renderer.domElement.addEventListener("pointerdown", this.handlePointerDown.bind(this));
            this.context.renderer.domElement.addEventListener("pointermove", this.handlePointerMove.bind(this));
            this.context.renderer.domElement.addEventListener("pointerup", this.handlePointerUp.bind(this));
            this.context.renderer.domElement.addEventListener("pointerleave", this.handlePointerLeave.bind(this));
            
            // Add keydown event listener for arrow keys and Q/E rotation
            this.keydownHandler = this.onKeyDown.bind(this);
            window.addEventListener("keydown", this.keydownHandler);
        }
    }

    protected unregisterInput() {
        this.context.renderer.domElement.removeEventListener("pointerdown", this.handlePointerDown.bind(this));
        this.context.renderer.domElement.removeEventListener("pointermove", this.handlePointerMove.bind(this));
        this.context.renderer.domElement.removeEventListener("pointerup", this.handlePointerUp.bind(this));
        this.context.renderer.domElement.removeEventListener("pointerleave", this.handlePointerLeave.bind(this));
        
        if (this.keydownHandler) {
            window.removeEventListener("keydown", this.keydownHandler);
        }
    }

    protected handlePointerDown(event: PointerEvent) {
        if (event.button === 0) {
            this.isDragging = true;
            this.lastPointerPosition.set(event.clientX, event.clientY);
            this.context.renderer.domElement.setPointerCapture(event.pointerId);
        }
    }

    protected handlePointerMove(event: PointerEvent) {
        if (this.isDragging && event.buttons === 1) {
            const deltaX = event.clientX - this.lastPointerPosition.x;
            const deltaY = event.clientY - this.lastPointerPosition.y;
            
            this.handleLookNum(deltaX, deltaY);
            this.lastPointerPosition.set(event.clientX, event.clientY);
        }
    }

    protected handlePointerUp(event: PointerEvent) {
        if (event.button === 0) {
            this.isDragging = false;
            this.context.renderer.domElement.releasePointerCapture(event.pointerId);
        }
    }

    protected handlePointerLeave(event: PointerEvent) {
        this.isDragging = false;
    }

    protected onKeyDown(event: KeyboardEvent) {
        // Prevent default behavior for arrow keys and space to avoid page scrolling
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
            event.preventDefault();
        }
        
        // Q/E keys for quick 30-degree rotation
        if (event.key === "q" || event.key === "Q") {
            event.preventDefault();
            // Rotate left by 30 degrees
            this.y += Mathf.toRadians(30);
            this.yRotTarget?.setRotationFromAxisAngle(this.upVector, this.y);
        } else if (event.key === "e" || event.key === "E") {
            event.preventDefault();
            // Rotate right by 30 degrees
            this.y -= Mathf.toRadians(30);
            this.yRotTarget?.setRotationFromAxisAngle(this.upVector, this.y);
        }
    }

    protected onOwnerChanged() {
        if (this.destroyed) return;

        if (!this.isInitialized) {
            this.initialize();
        }

        this.setRole(this.isLocalPlayer());
    }

    setCamRotationFromObject() {
        const charFwd = new Vector3();
        this.yRotTarget?.getWorldDirection(charFwd);
        charFwd.y = 0;
        charFwd.normalize();

        const wFwd = new Vector3(0, 0, 1);
        const wRight = new Vector3(1, 0, 0);
        const sign = wRight.dot(charFwd) > 0 ? 1 : -1;
        this.y = wFwd.angleTo(charFwd) * sign;
    }

    isMultiplayer(): boolean {
        return this.playerState != null && this.context.connection.isInRoom;
    }

    isLocalPlayer(): boolean {
        const isLocal = this.playerState != null && this.playerState!.isLocalPlayer;
        return isLocal || !this.isMultiplayer();
    }

    setRole(isLocal: boolean): void {
        if (this.controller) {
            this.controller.enabled = isLocal;
            this.controller.rigidbody.isKinematic = !isLocal;
        }
        this.enabled = isLocal;

        if (isLocal) {
            this.syncedTransform?.requestOwnership();
            this.registerInput();
        } else {
            this.unregisterInput();
        }

        if (this.mainCamera) {
            this.mainCamera.enabled = isLocal;
        }
    }

    onBeforeRender() {
        if (!this.isInitialized) return;

        if (this.enableTouchInput && this.isMobile) {
            this.gatherMobileInput();
        }

        if (this.enableDesktopInput) {
            this.gatherDesktopInput();
        }

        this.handleMove(this.moveInput, this.jumpInput, this.sprintInput, () => this.jumpInput = false);

        this.moveInput.set(0, 0);
        this.sprintInput = false;
    }

    protected gatherMobileInput() {
        const delta = this.context.input.getPointerPositionDelta(0);
        if (delta && this.isDragging) {
            this.lookInput.copy(delta);
            this.handleLookVec(this.lookInput);
        }
    }

    protected gatherDesktopInput() {
        const input = this.context.input;

        if (input.isKeyPressed("s") || input.isKeyPressed("ArrowDown"))
            this.moveInput.y += -1;
        else if (input.isKeyPressed("w") || input.isKeyPressed("ArrowUp"))
            this.moveInput.y += 1;
        if (input.isKeyPressed("d") || input.isKeyPressed("ArrowRight"))
            this.moveInput.x += 1;
        else if (input.isKeyPressed("a") || input.isKeyPressed("ArrowLeft"))
            this.moveInput.x += -1;

        if (input.isKeyDown(" "))
            this.jumpInput ||= true;
        else if (input.isKeyUp(" "))
            this.jumpInput = false;
        this.sprintInput ||= input.isKeyPressed("Shift");
    }

    protected handleLookVec(look: Vector2) {
        this.handleLookNum(look.x, look.y);
    }

    private upVector = new Vector3(0, 1, 0);
    protected handleLookNum(lookX: number, lookY: number) {
        const x = -lookY / this.context.domHeight * this.lookSensitivity;
        const y = -lookX / this.context.domWidth * this.lookSensitivity;

        this.x = MathUtils.clamp(this.x + x, Mathf.toRadians(this.xRotClamp.x), Mathf.toRadians(this.xRotClamp.y));
        this.y += y;

        this.yRotTarget?.setRotationFromAxisAngle(this.upVector, this.y);

        if (this.xRotTarget) {
            this.xRotTarget.rotation.x = -this.x + Math.PI;
        }
    }

    private moveDir = new Vector3();
    private fwdDir = new Vector3();
    private upDir = new Vector3(0, 1, 0);
    private rightDir = new Vector3();
    private jumpVec = new Vector3();

    protected handleMove(move: Vector2, jump: boolean, sprint: boolean, onJump?: () => void) {
        if (!this.controller) return;

        const deltaTime = this.context.time.deltaTime;

        this.gameObject.getWorldDirection(this.fwdDir);
        this.rightDir.crossVectors(this.upDir, this.fwdDir);

        this.moveDir.set(0, 0, 0);
        this.moveDir.add(this.fwdDir.multiplyScalar(move.y));
        this.moveDir.add(this.rightDir.multiplyScalar(-move.x));
        this.moveDir.clampLength(0, 1);

        const speed = sprint ? this.sprintSpeed : this.movementSpeed;
        this.moveDir.multiplyScalar(speed * deltaTime);

        const rigidbody = this.controller.rigidbody;

        if (jump && this.controller.isGrounded) {
            this.jumpVec.set(0, 1, 0);
            this.jumpVec.multiplyScalar(this.jumpSpeed);

            const vel = rigidbody.getVelocity();
            vel.y = 0;
            rigidbody.setVelocity(vel);
            rigidbody.applyImpulse(this.jumpVec);
            onJump?.();
        }

        rigidbody.applyImpulse(this.moveDir);

        const vel = rigidbody.getVelocity();
        const origY = vel.y;
        const max = sprint ? this.maxSprintSpeed : this.maxSpeed;
        vel.y = 0;
        vel.clampLength(0, max);
        vel.y = origY;
        rigidbody.setVelocity(vel);
    }
}