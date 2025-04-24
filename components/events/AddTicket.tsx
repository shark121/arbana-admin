import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { AvailableSeatsType } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

export default function AddTicket({
  tickets,
  setTickets
}: {
  tickets: AvailableSeatsType[];
  setTickets: React.Dispatch<React.SetStateAction<AvailableSeatsType[]>>;
}) {
  // State for the form inputs
  const [ticketInput, setTicketInput] = useState<AvailableSeatsType>({
    tier: '',
    price: 0,
    groupNumber: 1,
    quantity: 1
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setTicketInput((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler for adding a ticket
  const handleAddTicket = () => {
    // Validate inputs (basic validation)
    if (
      !ticketInput.tier ||
      !ticketInput.price ||
      !ticketInput.groupNumber ||
      !ticketInput.quantity
    ) {
      return;
    }

    if (tickets.some((seat) => seat.tier === ticketInput.tier)) {
      window.alert('Ticket tier already exists');
      return;
    }

    // Create a new ticket with a unique ID
    const newTicket = {
      id: Date.now(),
      ...ticketInput
    };

    // Add the new ticket to the tickets array
    setTickets((prev) => [...prev, newTicket]);

    // Clear the form
    setTicketInput({
      tier: '',
      price: 0,
      groupNumber: 1,
      quantity: 0
    });
  };

  // Handler for deleting a ticket
  const handleDeleteTicket = (tier: string) => {
    setTickets((prev) => prev.filter((ticket) => ticket.tier !== tier));
  };

  return (
    <div className='flex  items-center justify-center flex-wrap '>
      <div className="flex justify-between max-w-2xl mx-auto gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Ticket Types</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tier">Tier</Label>
              <Input
                id="tier"
                name="tier"
                value={ticketInput.tier}
                onChange={handleInputChange}
                placeholder="e.g. VIP, Standard"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={ticketInput.price}
                onChange={handleInputChange}
                placeholder="e.g. 100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Number</Label>
              <Input
                id="number"
                name="number"
                defaultValue={ticketInput.groupNumber ?? 0}
                onChange={handleInputChange}
                // placeholder="e.g. A1, B2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={ticketInput.quantity}
                onChange={handleInputChange}
                placeholder="e.g. 2"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" onClick={handleAddTicket}>
              Add Ticket
            </Button>
          </CardFooter>
        </Card>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Tickets ({tickets.length})</h2>

          {tickets.length === 0 ? (
            <div className="text-center p-6 border rounded-lg bg-gray-50">
              No tickets added yet
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tickets.map((ticket) => (
                <Card key={ticket.tier} className="bg-white w-[20rem]">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50">
                          {ticket.tier}
                        </Badge>
                        <span className="font-medium">
                          #{ticket.groupNumber}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>Price: ${ticket.price}</span>
                        <span>Qty: {ticket.quantity}</span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTicket(ticket.tier)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
