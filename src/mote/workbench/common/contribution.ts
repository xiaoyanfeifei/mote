import { BrandedService } from "vs/platform/instantiation/common/instantiation";

/**
 * A workbench contribution that will be loaded when the workbench starts and disposed when the workbench shuts down.
 */
 export interface IWorkbenchContribution {
	// Marker Interface
}

export namespace Extensions {
	export const Workbench = 'workbench.contributions.kind';
}

type IWorkbenchContributionSignature<Service extends BrandedService[]> = new (...services: Service) => IWorkbenchContribution;
