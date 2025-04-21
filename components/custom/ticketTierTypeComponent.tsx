"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { TicketType } from "../events/eventComponent";
import { AvailableSeatsType } from "../../types";
import { z } from "zod";
import { group } from "console";
import LocationSVG from "../../images/svg/location";
import { generateRandomId } from "@/lib/utils";
import Image from "next/image";
import { motion as m } from "framer-motion";
import { EventSchemaType } from "../../types";
export type TicketType = {
  tier: string;
  number: number;
  price: number;
};

type EventType = EventSchemaType & { imageFile: any };
// export type EventType = {
//   eventId: number;
//   name: string;
//   startDate: string;
//   endDate: string;
//   time : string;
//   location: string;
//   description: string;
//   availableSeats: TicketType[];
//   level?: string;
//   categories: string[];
//   imageUrl: string;
//   creatorMailAdress?:string | null |undefined
//   createdAt?: string;
//   fallBackMailAdress?: string;
//   userID: string;
//   imageFile : any
// };

export default function EventComponent({ event }: { event: EventType }) {
  function handleOnClick() {
    const eventInfo = JSON.stringify(event);
    const eventID = generateRandomId(10);
    sessionStorage.setItem(`${event.eventId}`, eventInfo);
    window.location.href = `/event/getEvent/${event.eventId}`;
  }

  const startDateToObject = new Date(event.startDate);
  const startDateToString = startDateToObject.toDateString();

  return (
    <m.button
      onClick={handleOnClick}
      className="  w-[95%] text-ellipsis text-[0.9rem] text-gray-700 border-b-[1px] flex items-start bg-white my-1 p-4   justify-start"
    >
      <div className="relative min-h-[5rem] w-[5rem] mr-2 rounded-xl flex items-center justify-center ">
        <Image
          src={event.imageUrl}
          alt="event image"
          fill
          className="rounded-xl object-cover "
        />
      </div>
      <div className="text-left p-0 flex flex-col gap-2 w-[65%] ">
        <div className="text-lg">
          {event.name.length > 25
            ? event.name.slice(0, 25) + "..."
            : event.name}
        </div>
        <div className="flex flex-col gap-1 text-[0.7rem]">
          <div>{startDateToString.split(" ").join(" • ")}</div>
          <div className="flex ">
            <div className="h-[1rem] w-[1rem] hidden  items-center justify-center">
              {/* <LocationSVG fill="#371fef" height="13px" width="13px" />
               */}
            </div>
            {/* {event.location.length > 20
              ? " " + event.location.slice(0, 20) + "..."
              : " " + event.location} */}
            <div className="text-gray-500 text-[0.8rem]">
              {/* {event.time}{", "} */}
              {"     "} 
              {event.location}
            </div>
          </div>
        </div>
      </div>
    </m.button>
  );
}


export const inputStyling =
  " bg-gray-50 rounded-2xl outline-none p-2 w-full h-[3rem] m-2";

export function TicketTierType({
  seat,
  RemoveTicketType,
  AddTicketType,
}: {
  seat: AvailableSeatsType;
  RemoveTicketType: ({ seat }: { seat: AvailableSeatsType }) => void;
  AddTicketType: (
    ticketTier: string,
    tierPrice: number,
    tierQuantity: number,
    groupNumber: number
  ) => void;
}) {
  const [ticketTier, setTicketTier] = useState<string>("");
  const [tierPrice, setTierPrice] = useState<number>(0);
  const [tierQuantity, setTierQuantity] = useState<number>(0);
  const [isAdded, setIsAdded] = useState<boolean>(true);
  const groupNumber = seat.groupNumber ? seat.groupNumber : 1;

  return (
    <div className="flex flex-col gap-2 items-center justify-center my-4">
      <Input
        placeholder="Ticket Tier"
        required={true}
        defaultValue={seat.tier}
        onChange={(e) => setTicketTier(e.target.value)}
        readOnly={true}
        className={inputStyling}
      />
      <Input
        placeholder="Ticket Price"
        defaultValue={seat.price}
        required={true}
        type="number"
        onChange={(e) => setTierPrice(Number(e.target.value))}
        readOnly={true}
        className={inputStyling}
      />
      <Input
        placeholder="Ticket Quantity"
        defaultValue={seat.quantity}
        required={true}
        type="number"
        onChange={(e) => setTierQuantity(Number(e.target.value))}
        readOnly={true}
        className={inputStyling}
      />
      {seat.groupNumber && (
        <Input
          placeholder="Ticket Quantity"
          defaultValue={seat.groupNumber}
          required={true}
          type="number"
          onChange={(e) => setTierQuantity(Number(e.target.value))}
          readOnly={true}
          className={inputStyling}
        />
      )}

      {isAdded ? (
        <Button onClick={(e) => RemoveTicketType({ seat })}>
          Remove Ticket
        </Button>
      ) : (
        <Button
          className="self-center"
          onClick={(e) => {
            if (!(ticketTier && tierPrice && tierQuantity)) {
              window.alert("Please fill all required ticket fields");
              return;
            }

            AddTicketType(ticketTier, tierPrice, tierQuantity, groupNumber);
            setIsAdded(true);
          }}
        >
          Add Tier
        </Button>
      )}
    </div>
  );
}

export function AddNewTicket({
  seatsState,
  setSeatsState,
  setIsAddingNewTicket,
}: {
  seatsState: AvailableSeatsType[];
  setSeatsState: React.Dispatch<React.SetStateAction<AvailableSeatsType[]>>;
  setIsAddingNewTicket: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [ticketTier, setTicketTier] = useState<string>("");
  const [tierPrice, setTierPrice] = useState<number>(0);
  const [tierQuantity, setTierQuantity] = useState<number>(0);
  const [groupNumber, setGroupNumber] = useState<number>(1);

  return (
    <div className="w-full flex items-center justify-center flex-col">
      <Input
        placeholder="Ticket Tier"
        required={true}
        onChange={(e) => setTicketTier(e.target.value)}
        className={inputStyling}
      />
      <Input
        placeholder="Ticket Price"
        required={true}
        type="number"
        onChange={(e) => setTierPrice(Number(e.target.value))}
        className={inputStyling}
      />
      <Input
        placeholder="Ticket Quantity"
        required={true}
        type="number"
        onChange={(e) => setTierQuantity(Number(e.target.value))}
        className={inputStyling}
      />
      <Input
        placeholder="Number per group"
        required={true}
        type="number"
        onChange={(e) => setGroupNumber(Number(e.target.value))}
        className={inputStyling}
      />

      <Button
        type="button"
        onClick={() => {
          if (!(ticketTier && tierPrice && tierQuantity && (groupNumber > 0))) {
            window.alert("Please fill all required ticket fields");
            return;
          }

          setSeatsState((seatsState) => [
            ...seatsState,
            {
              tier: ticketTier,
              price: tierPrice,
              quantity: tierQuantity,
              groupNumber: groupNumber,
            },
          ]);

          setIsAddingNewTicket(false);
        }}
      >
        Add Ticket
      </Button>
    </div>
  );
}
