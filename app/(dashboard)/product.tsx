import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Link, MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { deleteProduct } from './actions';
import { EventSchemaType } from 'types';

export function Product({ product }: { product: EventSchemaType }) {
  return (
    <TableRow>
      <TableCell className="hidden sm:table-cell">
        <Image
          alt="Product image"
          className="aspect-square rounded-md object-cover"
          height="64"
          src={product.imageUrl}
          width="64"
        />
      </TableCell>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {product.location}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">{`${new Date(product.createdAt).toLocaleDateString()}`}</TableCell>
      <TableCell className="hidden md:table-cell">
        {new Date(product.startDate).toLocaleDateString()}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {/* {product.availableAt.toLocaleDateString("en-US")} */}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <button onClick={()=>window.location.href = `/edit/${product.eventId}`}>Edit</button>
              </DropdownMenuItem>
            <DropdownMenuItem>
              <form action={deleteProduct}>
                <button>View</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
