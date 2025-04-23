"use client";

import { collection, getDoc, doc } from "firebase/firestore";
import { database } from "../../../../firebase.config";
// import ScanQRCode from "../../scan/[[...data]]/page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  convertTo12HourFormat,
  generateRandomId,
  getCookie,
} from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Selector } from "../../../../components/custom/selector";
import { categoriesList } from "../../../../data/categories";
import z from "zod";
import {LocalUserType} from "../../../../types"
import  AddTicket from "../../../../components/events/AddTicket";
import { CategoriesComponent } from "../../../../components/events/categoriesComponent";
import Calendar from "../../../../components/custom/calendar";
import TicketPopOver from "../../../../components/custom/ticketPopOver";
import ShowPlaces from "../../../../components/mapComponents/showPlaces";
import Cookies from "js-cookie";
import { useLoadScript } from "@react-google-maps/api";


import { zodResolver } from "@hookform/resolvers/zod";
import {
  EventSchema,
  EventSchemaType,
  AvailableSeatsSchema,
  AvailableSeatsType,
} from "../../../../types";

import AddImage from "../../../../images/svg/addImage";

import { convertTo24Hour, getLocationCoordiantes } from "@/lib/utils";

import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Vibrant } from "node-vibrant/browser";
import Verified from "../../../../images/svg/verified";
import Loading from "../../../../loading";
import SuccessAnimation from "../../../../animations/success";
// import Img from "next/image";

async function generatePallete(imageFile: File) {
  const imageUrl = URL.createObjectURL(imageFile);

  const image = new Image();
  image.src = imageUrl;

  return await Vibrant.from(image)
    .getPalette()
    .then((palette: any) => {
      console.log(palette, "palette");
      return palette;
    })
    .catch((err: any) => {
      console.log(String(err), "err");
      return null;
    });
}

// import Image  from "next/image";

async function sendUpdateRequest({ event, auth }: { event: EventSchemaType, auth: LocalUserType }) {
  const { imageFile, ...rest } = event;
  const requestFormData = new FormData();
  imageFile && requestFormData.append("imageFile", imageFile);
  requestFormData.append("rest", JSON.stringify(rest));
  requestFormData.append("auth", JSON.stringify(auth));

  await fetch("/api/events/update/", {
    method: "POST",
    body: requestFormData,
  })
    .then((res) => res.json())
    .then((data) => console.log("updat request sent", data))
    .catch((error) => console.log(error));
}

type RequestType = EventSchemaType & { imageFile: File | null };

export default function EventInfo(params: {
  params: Promise<{ data: [eventId: string] }>;
}) {
  const [eventState, setEventState] = useState<EventSchemaType>();
  

  useEffect(() => {
    async function fetchdata(){
      const { data } = await params.params;
      const eventId = data[0];
      getDoc(doc(collection(database, "events"), eventId)).then(
        (doc) => {
          console.log(doc.data(), "collected data");
          // console.log(doc.id, "doc id");
          setEventState(doc.data() as EventSchemaType);
        }
      );
    }

    fetchdata();
  }, []);

  const [availableSeatsState, setAvailableSeatsState] = useState<
    AvailableSeatsType[]
  >([]);
  const [currentItem, setCurrentItem] = useState<string>("");
  const [seatsState, setSeatsState] = useState<AvailableSeatsType[]>([]);
  const [categoriesState, setCategoriesState] = useState<string[]>([]);
  const [chosenCategoriesList, setChosenCategoriesList] =
    useState<React.JSX.Element[]>();
  const [imageFileState, setImageFileState] = useState<File | null>(null);
  const [eventIDState, setEventIDState] = useState<number>(
    Number(generateRandomId(20))
  );
  const [userInfoState, setUserInfoState] = useState<LocalUserType>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startDateState, setStartDateState] = useState<Date | undefined>();
  const [endDateState, setEndDateState] = useState<Date | undefined>();
  const [eventNameState, setEventNameState] = useState<string>("");
  const [selected, setSelected] = useState({ id: 0, description: "" });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState({
    place_id: "",
    description: "",
  });
  const { isLoaded: mapIsLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"],
  });

  useEffect(() => {
    if (imageFileState) {
      const imageUrl = URL.createObjectURL(imageFileState);
      setPreviewUrl(imageUrl);
    }
  }, [imageFileState]);

  useEffect(() => {
    // const userInfo = JSON.parse(sessionStorage.getItem("user") as string);
    const userInfo = JSON.parse(Cookies.get("user") as string || "{}");
    setUserInfoState(userInfo);

    console.log(eventState, "user info");
  }, []);

  useEffect(() => {
    console.log(categoriesState, "currentItem");
    categoriesState && categoriesState?.includes(currentItem)
      ? null
      : setCategoriesState([...categoriesState, currentItem]);
  }, [currentItem]);

  useEffect(() => {
    setChosenCategoriesList(
      categoriesState?.map((category, i) => {
        if (category === "") return <div></div>;

        return (
          <CategoriesComponent
            currentItem={category}
            key={i}
            categoriesState={categoriesState}
            setCategoriesState={setCategoriesState}
          />
        );
      })
    );
  }, [categoriesState]);

  useEffect(() => {
    console.log(categoriesState, "categories state");
  }, [categoriesState]);

  const FormValidEventSchema = EventSchema.omit({
    createdAt: true,
    userID: true,
    categories: true,
    availableSeats: true,
    eventId: true,
    imagePallete: true,
    creator: true,
    name: true,
    startDate: true,
    endDate: true,
    location: true,
    locationCoordinates: true,
    locationId: true,
  });

  const form = useForm<z.infer<typeof FormValidEventSchema>>({
    resolver: zodResolver(FormValidEventSchema),
    defaultValues: {
      // name: "",
      // startDate: "",
      // endDate: "",
      province: "",
      mobile: "",
      imageFile: null,
      description: "",
      // location: "",
      time: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    console.log(eventState, "event state");
    eventState && setSeatsState(
      eventState?.availableSeats as unknown as AvailableSeatsType[]
    );
    setEventIDState(eventState?.eventId as number);
    setCategoriesState(eventState?.categories as string[]);
    setStartDateState(new Date(eventState?.startDate as string));
    setEndDateState(new Date(eventState?.endDate as string));
    setEventNameState(eventState?.name as string);
    setSelectedPlace({
      place_id: eventState?.location as string,
      description: eventState?.location as string,
    });

    // form.setValue("name", eventState?.name as string);
    // form.setValue("startDate", eventState?.startDate as string);
    // form.setValue("endDate", eventState?.endDate as string);
    form.setValue("province", eventState?.province as string);
    form.setValue("mobile", eventState?.mobile as string);
    form.setValue("description", eventState?.description as string);
    // form.setValue("location", eventState?.location as string);
    eventState?.time && form.setValue("time", convertTo24Hour(eventState.time));
    form.setValue("imageUrl", eventState?.imageUrl as string);

    setPreviewUrl(eventState?.imageUrl as string);
  }, [eventState]);

  const onSubmit = async (
    event: z.infer<Omit<typeof FormValidEventSchema, "imageFile">>
  ) => {
    const fileteredCategories = categoriesState.filter(
      (category) => category !== ""
    );

    console.log(imageFileState, "imageFileState");
    // console.log(event.imageFile.target.files[0], "event.imageFile.target.files");

    console.log(event, "event");
    const FormValidEventSchemaParseSuccess =
      FormValidEventSchema.safeParse(event).success;

    console.log(
      FormValidEventSchemaParseSuccess,
      "FormValidEventSchemaParseSuccess"
    );

    setIsLoading(true);

    console.log(imageFileState, "imageFileState");

    let palette: { Vibrant: { rgb: [number, number, number] } } =
      eventState?.imagePallete ?? { Vibrant: { rgb: [0, 0, 0] } };

    const locationId =
      selectedPlace.place_id ?? (eventState?.locationId as string);

    if (imageFileState) {
      palette = await generatePallete(imageFileState);
      console.log(palette, "palette");
    }

    event["time"] = convertTo12HourFormat(event.time);

    const locationCoordinates = await getLocationCoordiantes(locationId);

    console.log(locationCoordinates, palette);
    // const locationCoordinates = { lat: 0, lng: 0 };

    const eventWithExtraParams: EventSchemaType = {
      ...event,
      categories: fileteredCategories,
      availableSeats: seatsState,
      userID: userInfoState?.uid!,
      createdAt: new Date().toISOString(),
      eventId: eventIDState,
      creator: eventState!.creator,
      imagePallete: palette ? palette : eventState!.imagePallete,
      name: eventNameState,
      startDate: startDateState?.toISOString() || new Date().toISOString(),
      endDate: endDateState?.toISOString() || new Date().toISOString(),
      location: selectedPlace.description,
      locationCoordinates,
      locationId,
    };

    // if (imageFileState) {
    //   eventWithExtraParams["imageFile"] = imageFileState;
    // }

    console.log(eventWithExtraParams, "eventWithExtraParams");

    if (!FormValidEventSchemaParseSuccess) {
      window.alert("Please fill in all the required fields");
      setIsLoading(false);

      return;
    }

    if (!eventWithExtraParams.userID) {
      window.alert("Please login to create an event");
      setIsLoading(false);

      return;
    }

    if (categoriesState.length === 0) {
      window.alert("Please select a genre");
      setIsLoading(false);

      return;
    }

    if (seatsState.length === 0) {
      window.alert("Please add a ticket tier");
      setIsLoading(false);

      return;
    }

    // return;

   userInfoState && await sendUpdateRequest({ event: eventWithExtraParams, auth: userInfoState })
      .catch((err) => console.log(err, "err"))
      .then(() => {
        setSuccess(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (success) return <SuccessAnimation navTo="/" />;

  if (isLoading || !mapIsLoaded) return <Loading />;

  return (
    eventState && (
      <div>
        <div className="h-[18rem] flex w-full flex-col p-4 gap-1">
          {/* <FormLabel>Event Name</FormLabel> */}
          <p className="text-sm font-medium">Event Name</p>
          <Input
            placeholder="Event Name"
            onChange={(e) => setEventNameState(e.target.value)}
            defaultValue={eventState?.name}
          />
          <p className="text-sm font-medium">Start Date</p>
          <Calendar
            setDateState={setStartDateState}
            dateState={startDateState}
            defaultDate={new Date(eventState?.startDate as string)}
          />
          <p className="text-sm font-medium">End Date</p>

          <Calendar
            setDateState={setEndDateState}
            dateState={endDateState}
            defaultDate={new Date(eventState?.endDate as string)}
          />
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 p-4"
            id="createEventForm"
          >
            <div className="w-full h-[7rem] relative">
              <FormLabel>Location</FormLabel>
              <ShowPlaces
                selected={selected}
                selectedPlace={selectedPlace}
                setSelected={setSelected}
                setSelectedPlace={setSelectedPlace}
              />
            </div>
            {
              <AddTicket
                tickets={seatsState}
                setTickets={setSeatsState}
              />
            }
            <Selector
              label="Genre"
              items={categoriesList}
              setCurrentItemState={setCurrentItem}
            />
            <div className="w-full ">{chosenCategoriesList}</div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input placeholder="Time" type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province</FormLabel>
                  <FormControl>
                    <Input placeholder="province" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />{" "}
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input placeholder="+233" {...field} />
                  </FormControl>
                  <FormDescription>
                    This number will be used for payment disbursements and
                    contact
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />{" "}
            <FormField
              control={form.control}
              name="imageFile"
              render={({ field }) => (
                <FormItem className="flex  gap-4 items-center">
                  <div className="w-[10rem] aspect-square bg-gray-100 rounded-md flex items-center justify-center relative">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="image preview"
                        className="h-full w-full"
                      />
                    ) : (
                      // <CameraIcon size={20} strokeWidth={"1px"} />
                      <AddImage size="30px"/>
                    )}
                    {/* <AddImage /> */}
                  </div>
                  <FormLabel>
                    <AddImage size="30px"/>
                  </FormLabel>
                  <FormControl>
                    <Input
                      // className={inputStyling}
                      className="hidden"
                      type="file"
                      accept="image/*"
                      max={"10000"}
                      placeholder="Selecet New Image"
                      //commented because the added fields only accept strings
                      // {...field}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        file && setImageFileState(file as unknown as File);
                        form.setValue("imageFile", file);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant={"outline"} className="flex gap-4">
              Submit
              <Verified height="20px" width="20px" bgfill="#ED191D" />
            </Button>
          </form>
        </Form>
      </div>
    )
  );
}
