import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button.tsx";



export default function AddToCalendar() {

	return (
		<div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="flex gap-2">
						Añadir al calendario
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem>
						<div>
							Apple
						</div>
						</DropdownMenuItem>
					<DropdownMenuItem>Google</DropdownMenuItem>
					<DropdownMenuItem>iCal File</DropdownMenuItem>
					<DropdownMenuItem>Outlook</DropdownMenuItem>
					<DropdownMenuItem>Outlook</DropdownMenuItem>
					<DropdownMenuItem>Yahoo</DropdownMenuItem>
					<DropdownMenuItem>Microsoft Teams</DropdownMenuItem>
					<DropdownMenuItem>Microsoft 365</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}