"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductsTable } from './products-table';
import { ArrowLeft, Plus, ChevronLeft } from "lucide-react";
import { COLORSMAP } from "../../data/colors";
import React from "react";
import { useRouter } from "next/navigation";
import { getDoc, collection, doc } from "firebase/firestore";
import { User } from "firebase/auth";
import { database } from "../../firebase.config";
import { EventSchemaType as EventType } from "../../types";
import { useEffect, useState } from "react";
// import ScanQRCode from "../scan/[[...data]]/page";
// import EventListComponent from "../../../components/components/events/eventComponent";
// import { comfortaa } from "../page";
import Loading from "../../loading";
import Cookies from "js-cookie";
import EmptyComponent from "../../components/custom/emptyComponent";
// import { getProducts } from '@/lib/db';

export default function ProductsPage(
  props: {
    searchParams: Promise<{ q: string; offset: string }>;
  }
) {
  // const searchParams = await props.searchParams;
  // const search = searchParams.q ?? '';
  // const offset = searchParams.offset ?? 0;
  // const { products, newOffset, totalProducts } = await getProducts(
  //   search,
  //   Number(offset)
  // );
  const [isLoading, setIsLoading] = useState(true);
  const [userState, setUserState] = useState<User>({} as User);
  const [loadingBuffer, setLoadingBuffer] = useState(true);
  const [userEvents, setUserEvents] = useState<EventType[] | null>([]);
  const router = useRouter();
  const userDocsRef = collection(database, "users");

  useEffect(() => {
    // const userJSON = JSON.parse((Cookies.get("user") as string) || "");
    // userJSON && setUserState(userJSON);

    fetch(`/api/user_events/`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({ uid: "h4tLf5B8YFdGB05pbIesB0EuDxj2" }),
    })
      .then((response) => response.json())
      .then((data: { data: EventType[] }) => {

        if (data.data.length == 0) {
          setUserEvents(null);
        } else {
          setUserEvents(data.data);
        }

      })
      .catch((error) => {
        console.error(error);
      });
    // }

    setIsLoading(false);
  }, []);

  setTimeout(() => {
    setLoadingBuffer(false);
  }, 500);

  if (isLoading || loadingBuffer || !userState) {
    return <Loading />;
  }

  return (
   userEvents && <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="archived" className="hidden sm:flex">
            Archived
          </TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Product
            </span>
          </Button>
        </div>
      </div>
      <TabsContent value="all">
        <ProductsTable
          products={userEvents}
          offset={0}
          totalProducts={userEvents.length ?? 0}
        />
      </TabsContent>
    </Tabs>
  );
}
