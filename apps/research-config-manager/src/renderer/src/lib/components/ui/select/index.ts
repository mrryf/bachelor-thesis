import { Select as SelectPrimitive } from "bits-ui";

import SelectTrigger from "./select-trigger.svelte";
import SelectContent from "./select-content.svelte";
import SelectItem from "./select-item.svelte";
import SelectScrollUpButton from "./select-scroll-up-button.svelte";
import SelectScrollDownButton from "./select-scroll-down-button.svelte";

const Root = SelectPrimitive.Root;
const Group = SelectPrimitive.Group;

export {
	Root,
	Group,
	SelectTrigger as Trigger,
	SelectContent as Content,
	SelectItem as Item,
	SelectScrollUpButton as ScrollUpButton,
	SelectScrollDownButton as ScrollDownButton,
	//
	Root as Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectScrollUpButton,
	SelectScrollDownButton,
};
