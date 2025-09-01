// Import types from dependencies
import "firstpersoncontroller"
import "firstpersoncontroller/codegen/register_types.js"
import "minixrnpm"
import "minixrnpm/codegen/register_types.js"

/* eslint-disable */
import { TypeStore } from "@needle-tools/engine"

// Import types
import { ImprovedFirstPersonController } from "../scripts/ImprovedFirstPersonController.js";

// Register types
TypeStore.add("ImprovedFirstPersonController", ImprovedFirstPersonController);
