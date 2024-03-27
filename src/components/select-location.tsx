import * as React from "react";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

type SelectLocationProps = {
	data: { [key: string]: string[] };
};

export function SelectLocation({ data }: SelectLocationProps) {
	return (
		<Select>
			<SelectTrigger className="w-[220px] flex gap-1">
				<MapPin className="size-5" /> <SelectValue placeholder="Todas las locaciones" />
			</SelectTrigger>
			<SelectContent>
				{Object.entries(data).map(([department, municipalities]) => (
					<SelectGroup key={department}>
						<SelectLabel>{department}</SelectLabel>
						{[...municipalities].map((municipality) => (
							<SelectItem key={municipality} value={municipality}>
								{municipality}
							</SelectItem>
						))}
					</SelectGroup>
				))}
			</SelectContent>
		</Select>
	);
}