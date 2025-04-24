"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { generateRandomId, getCookie } from "../../../lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Selector } from "../../../components/custom/selector";
import { categoriesList } from "../../../data/categories";
import { CategoriesComponent } from "../../../components/events/categoriesComponent";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Verified } from "lucide-react";
import { Plug2Icon  as AddImage } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { LocalUserType } from "../../../types";
import AddTicket from "../../../components/events/AddTicket";
import Cookies from "js-cookie";
import {
  EventSchemaType,
  EventSchemaType as EventType,
  AvailableSeatsType,
  EventSchema,
} from "../../../types";
import { zodResolver } from "@hookform/resolvers/zod";
import SuccessAnimation from "../../../animations/success";
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
import {
  rgbToHex,
  getLocationCoordiantes,
  convertTo12HourFormat,
} from "@/lib/utils";
import Loading from "../../../loading";
import ShowPlaces from "../../../components/mapComponents/showPlaces";
import { useLoadScript } from "@react-google-maps/api";
import Calendar from "../../../components/custom/calendar";
import { CameraIcon, EditIcon } from "lucide-react";

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

type RequestType = EventType;

export const inputStyling =
  " bg-gray-50 rounded-3xl outline-none p-2 w-full h-[4rem] w-[20rem]";

export type createRequestType = Omit<RequestType, "imageUrl">;

async function sendCreateRequest({
  event,
  authInfo,
}: {
  event: createRequestType;
  authInfo: { uid: string; authToken: string };
}) {
  const { imageFile, ...rest } = event;
  const requestFormData = new FormData();
  imageFile && requestFormData.append("imageFile", imageFile);
  requestFormData.append("rest", JSON.stringify(rest));
  requestFormData.append("authInfo", JSON.stringify(authInfo));

  console.log(event, "requestFormData");

  return await fetch("/api/events/create/", {
    method: "POST",
    body: requestFormData,
  })
    .then((res) => res.json())
    .then((data) => console.log(data, "event data"))
    .catch((error) => {
      window.alert(`An error occured ${String(error)}`);
      console.log(error);
    });
}

export default function CreateEvent() {
  const [currentItem, setCurrentItem] = useState<string>("");
  const [categoriesState, setCategoriesState] = useState<string[]>([]);
  const [chosenCategoriesList, setChosenCategoriesList] =
    useState<React.JSX.Element[]>();
  const [imageFileState, setImageFileState] = useState<File | null>(null);
  const [userInfoState, setUserInfoState] = useState<LocalUserType>();
  const [locationDataState, setLocationDataState] = useState();
  const [startDateState, setStartDateState] = useState<Date | undefined>();
  const [endDateState, setEndDateState] = useState<Date | undefined>();
  const [eventNameState, setEventNameState] = useState<string>("");
  const [seatsState, setSeatsState] = useState<AvailableSeatsType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (imageFileState) {
      const imageUrl = URL.createObjectURL(imageFileState);
      setPreviewUrl(imageUrl);
    }
  }, [imageFileState]);

  const { isLoaded: mapIsLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"],
  });
  const [selected, setSelected] = useState({ id: 0, description: "" });
  const [selectedPlace, setSelectedPlace] = useState({
    place_id: "",
    description: "",
  });

  useEffect(() => {
    const userInfo = JSON.parse(Cookies.get("user") as string);
    setUserInfoState(userInfo);
  }, []);

  useEffect(() => {
    console.log(currentItem, "currentItem");

    categoriesState?.includes(currentItem) ||
      setCategoriesState((categoriesState) => [
        ...categoriesState,
        currentItem,
      ]);
  }, [currentItem]);

  useEffect(() => {
    console.log(categoriesState.length);

    setChosenCategoriesList(
      categoriesState?.map((category, i) => {
        if (category === "") return <div key={i}></div>;

        return (
          <CategoriesComponent
            currentItem={category}
            key={category}
            categoriesState={categoriesState}
            setCategoriesState={setCategoriesState}
          />
        );
      })
    );
  }, [categoriesState]);

  const FormValidEventSchema = z.object({
    // name: z.string(),
    // startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    // endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    province: z.string().min(3, "Province must be at least 3 characters"),
    mobile: z.string().regex(/^\+?\d{10,14}$/, "Invalid mobile number"),
    imageFile: z
      .instanceof(File)
      .refine(
        (file) => file.size < 5000000 || !file,
        "You must provide an image file less than 5MB"
      ),
    // location: z.string().min(3, "Location must be provided"),
    // imageFile :
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    time: z.string().min(1, "Time must be provided"),
  });

//   type FormValidEventSchema = Pick<EventSchemaType, "name" | "startDate" | "endDate" | "province" | "mobile" | "description" | "location" | "time"> & { imageFile: any };

  const form = useForm<z.infer<typeof FormValidEventSchema>>({
    resolver: zodResolver(FormValidEventSchema),
    defaultValues: {
      // name: "",
      // startDate: "",
      // endDate: "",
      province: "",
      mobile: "",
      imageFile: undefined,
      description: "",
      // location: "",
      time: "",
    },
  });


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

    if (!startDateState || !endDateState) {
      window.alert("Please fill in the start and end date");
      return;
    }

    if (!eventNameState)
      if (!FormValidEventSchemaParseSuccess) {
        window.alert("Please fill in all the required fields");
        return;
      }

    if (categoriesState.length === 0) {
      window.alert("Please select a category");
      return;
    }

    if (seatsState.length === 0) {
      window.alert("Please add a ticket tier");
      return;
    }

    if (!selectedPlace) {
      window.alert("Please select a location");
      return;
    }

    const imagePallete = await generatePallete(imageFileState as File);

    console.log(selectedPlace.place_id, "place_id");

    const locationCoordinates = await getLocationCoordiantes(
      selectedPlace.place_id
    );

    console.log(imageFileState, "imageFileState");

    console.log(selectedPlace, "selectedPlace");

    event["time"] = convertTo12HourFormat(event["time"]);

    setIsLoading(true);

    const eventWithExtraParams: EventSchemaType = {
      ...event,
      name: eventNameState,
      startDate: startDateState?.toISOString() || new Date().toISOString(),
      endDate: endDateState?.toISOString() || new Date().toISOString(),
      categories: fileteredCategories,
      availableSeats: seatsState,
      userID: userInfoState?.uid!,
      createdAt: new Date().toISOString(),
      eventId: Number(generateRandomId(5)),
      imageUrl: "",
      creator: {
        name: userInfoState?.displayName!,
        email: userInfoState?.email!,
        verified: userInfoState?.emailVerified!,
        uid: userInfoState?.uid!,
      },
      imagePallete,
      location: selectedPlace.description,
      locationCoordinates,
      locationId: selectedPlace.place_id,
    };

    if (!eventWithExtraParams.userID) {
      window.alert("Please login to create an event");
      return;
    }

    console.log(eventWithExtraParams, "eventWithExtraParams");

    await sendCreateRequest({
      event: eventWithExtraParams,
      authInfo: { uid: userInfoState?.uid!, authToken: userInfoState?.token! },
    })
      .catch((err) => console.log(err, "err"))
      .then((res: any) => {
        setSuccess(true);
      })
      .finally(() => setIsLoading(false));
  };

  if (isLoading || !mapIsLoaded) return <Loading />;

  if (success) return <SuccessAnimation navTo="/" />;

  // function SubmitTest(e: any) {
  //   console.log(e);
  // }

  // return (
  //   <div className="">
  //     <div className="h-[18rem] flex w-full flex-col p-4 gap-1">
  //       {/* <FormLabel>Event Name</FormLabel> */}
  //       <p className="text-sm font-medium">Event Name</p>
  //       <Input
  //         placeholder="Event Name"
  //         onChange={(e) => setEventNameState(e.target.value)}
  //       />
  //       <p className="text-sm font-medium">Start Date</p>

  //       <Calendar setDateState={setStartDateState} dateState={startDateState} />
  //       <p className="text-sm font-medium">End Date</p>

  //       <Calendar setDateState={setEndDateState} dateState={endDateState} />
  //     </div>
  //     <Form {...form}>
  //       <form
  //         onSubmit={form.handleSubmit(onSubmit)}
  //         className="space-y-8 p-4"
  //         id="createEventForm"
  //       >
  //         {
  //           <AddTicket
  //             tickets={seatsState}
  //             setTickets={setSeatsState}
  //           />
  //         }
  //         <Selector
  //           label="Genre"
  //           items={categoriesList}
  //           setCurrentItemState={setCurrentItem}
  //         />
  //         <div className="w-full ">{chosenCategoriesList}</div>
  //         <FormField
  //           control={form.control}
  //           name="description"
  //           render={({ field }) => (
  //             <FormItem>
  //               <FormLabel>Description</FormLabel>
  //               <FormControl>
  //                 <Textarea placeholder="Description" {...field} />
  //               </FormControl>
  //               <FormMessage />
  //             </FormItem>
  //           )}
  //         />
  //         <div className="w-full h-[7rem] relative">
  //           <FormLabel>Location</FormLabel>
  //           <ShowPlaces
  //             selected={selected}
  //             selectedPlace={selectedPlace}
  //             setSelected={setSelected}
  //             setSelectedPlace={setSelectedPlace}
  //           />
  //         </div>
  //         <FormField
  //           control={form.control}
  //           name="time"
  //           render={({ field }) => (
  //             <FormItem>
  //               <FormLabel>Time</FormLabel>
  //               <FormControl>
  //                 <Input placeholder="Time" type="time" {...field} />
  //               </FormControl>
  //               <FormMessage />
  //             </FormItem>
  //           )}
  //         />
  //         <FormField
  //           control={form.control}
  //           name="province"
  //           render={({ field }) => (
  //             <FormItem>
  //               <FormLabel>Province</FormLabel>
  //               <FormControl>
  //                 <Input placeholder="province" {...field} />
  //               </FormControl>
  //               <FormMessage />
  //             </FormItem>
  //           )}
  //         />{" "}
  //         <FormField
  //           control={form.control}
  //           name="mobile"
  //           render={({ field }) => (
  //             <FormItem>
  //               <FormLabel>Mobile</FormLabel>
  //               <FormControl>
  //                 <Input placeholder="+233" {...field} />
  //               </FormControl>
  //               <FormDescription>
  //                 This number will be used for payment disbursements and contact
  //               </FormDescription>
  //               <FormMessage />
  //             </FormItem>
  //           )}
  //         />{" "}
  //         <FormField
  //           control={form.control}
  //           name="imageFile"
  //           render={({ field }) => (
  //             <FormItem className="flex  gap-4 items-center">
  //               <div className="w-[10rem] aspect-square bg-gray-100 rounded-md flex items-center justify-center relative">
  //                 {previewUrl ? (
  //                   <img
  //                     src={previewUrl}
  //                     alt="image preview"
  //                     className="h-full w-full"
  //                   />
  //                 ) : (
  //                   <CameraIcon size={20} strokeWidth={"1px"} />
  //                 )}
  //               </div>
  //               <FormLabel>
  //                 <EditIcon size={20} className="cursor-pointer" />
  //               </FormLabel>
  //               <FormControl>
  //                 <Input
  //                   className={"hidden"}
  //                   type="file"
  //                   accept="image/*"
  //                   // max={"10000"}
  //                   placeholder="Image"
  //                   //commented because the added fields only accept strings
  //                   // {...field}
  //                   onChange={(e) => {
  //                     const file = e.target.files?.[0];
  //                     file && setImageFileState(file as unknown as File);
  //                     if (file) {
  //                       form.setValue("imageFile", file);
  //                     }
  //                   }}
  //                 />
  //               </FormControl>
  //               <FormMessage />
  //             </FormItem>
  //           )}
  //         />
  //         <Button type="submit">Submit</Button>
  //       </form>
  //     </Form>
  //   </div>
  // );

  return(

      <Card className="w-full max-w-4xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
             Create Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic Details</TabsTrigger>
              <TabsTrigger value="location">Location & Time</TabsTrigger>
              <TabsTrigger value="tickets">Tickets & Media</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                id="createEventForm"
              >
                <TabsContent value="basic" className="space-y-6">
                  <div className="flex w-full h-full p-4">
                    <div className='w-full h-full flex flex-col gap-4'>
                      <FormField
                        control={form.control}
                        name="imageFile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Cover Image</FormLabel>
                            <div className="flex flex-col items-start justify-between gap-4">
                              <div className="w-60 aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                {previewUrl ? (
                                  <img
                                    src={previewUrl}
                                    alt="Event cover"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <AddImage size={'32'} />
                                )}
                              </div>
                              <div className="space-y-2">
                                <FormControl>
                                  <Input
                                    className="max-w-[10rem]"
                                    type="file"
                                    accept="image/*"
                                    max="10000"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setImageFileState(file);
                                        form.setValue('imageFile', file);
                                      }
                                    }}
                                  />
                                </FormControl>
                                {/* <FormDescription>
                                  Upload a high-quality image (max 10MB)
                                </FormDescription> */}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <FormItem className="space-y-2 w-[10rem]">
                        <FormLabel className="text-sm font-medium">
                          Event Name
                        </FormLabel>

                        <Input
                          placeholder="Enter a compelling event name"
                          onChange={(e) => setEventNameState(e.target.value)}
                          defaultValue={""}
                          className="w-[25rem]"
                        />
                      </FormItem>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your event in detail"
                                {...field}
                                className="min-h-32 w-[25rem]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Select time"
                              type="time"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div> */}

                  <div className="space-y-2">
                    <Selector
                      label="Genre"
                      items={categoriesList}
                      setCurrentItemState={setCurrentItem}
                    />
                    <div className="min-h-12 py-2">{chosenCategoriesList}</div>
                  </div>
                </TabsContent>

                <TabsContent value="location" className="space-y-6">
                  <div className="space-y-2 w-full h-full flex flex-col my-6">
                    <FormLabel>Event Location</FormLabel>
                    <div className="my-6 w-full h-[3rem]">
                      <ShowPlaces
                        selected={selected}
                        selectedPlace={selectedPlace}
                        setSelected={setSelected}
                        setSelectedPlace={setSelectedPlace}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {/* <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province/State</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter province or state"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    <div className="grid md:grid-cols-2 gap-6 my-6">
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          Start Date
                        </FormLabel>
                        <div className="border rounded-md p-3">
                          <Calendar
                            setDateState={setStartDateState}
                            dateState={startDateState}
                            defaultDate={
                              new Date()
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium">
                          End Date
                        </FormLabel>
                        <div className="border rounded-md p-3">
                          <Calendar
                            setDateState={setEndDateState}
                            dateState={endDateState}
                            defaultDate={
                              new Date()
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Select time"
                                type="time"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+233" {...field} />
                          </FormControl>
                          <FormDescription>
                            For payment disbursements and contact
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="tickets" className="space-y-6">
                  <div className="space-y-2">
                    <FormLabel className="text-lg font-medium">
                      Ticket Information
                    </FormLabel>
                    <AddTicket
                      tickets={seatsState}
                      setTickets={setSeatsState}
                    />
                  </div>

                  <Separator className="my-4" />

                  {/* <div className="space-y-4">
                    <FormLabel className="text-lg font-medium">
                      Event Details
                    </FormLabel>

                   

                    {/* <FormField
                      control={form.control}
                      name="imageFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Cover Image</FormLabel>
                          <div className="flex items-start gap-4">
                            <div className="w-40 aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                              {previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt="Event cover"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <AddImage className="text-gray-400" size={32} />
                              )}
                            </div>
                            <div className="space-y-2">
                              <FormControl>
                                <Input
                                  className="max-w-xs"
                                  type="file"
                                  accept="image/*"
                                  max="10000"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setImageFileState(file);
                                      form.setValue('imageFile', file);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Upload a high-quality image (max 10MB)
                              </FormDescription>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> 
                  </div> */}
                </TabsContent>

                <CardFooter className="flex justify-end border-t pt-6 mt-6">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <span>Create Event</span>
                    <Verified className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    )
  
}
