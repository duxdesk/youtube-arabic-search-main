import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";  // For loading

const Creators = () => {
  const { data: creators, isLoading } = useQuery({
    queryKey: ["creators"],
    queryFn: () => supabase.from("creators").select("*").then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <h2 className="text-2xl mb-4">Arabic Creators</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Channel</TableCell>
            <TableCell>Subscribers</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {creators?.map(creator => (
            <TableRow key={creator.id}>
              <TableCell>{creator.name}</TableCell>
              <TableCell>{creator.channel}</TableCell>
              <TableCell>{creator.subs}</TableCell>
            </TableRow>
          )) || <TableRow><TableCell colSpan={3}>No creators found</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
};

export default Creators;
