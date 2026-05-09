import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Building, 
  MapPin, 
  Smartphone, 
  Armchair, 
  Save, 
  Info,
  Globe,
  Settings,
  ShieldCheck,
  Gem,
  Lock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getCurrentLibrary, updateLibrary, type Library } from "@/lib/library";
import { updateLibraryMetadata } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  totalSeats: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "Must have at least 1 seat")
  ),
  contact: z.string().min(10, "Contact must be at least 10 digits"),
});

type FormValues = z.infer<typeof schema>;

export default function InstituteInfo() {
  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    async function fetchLibrary() {
      try {
        const data = await getCurrentLibrary();
        setLibrary(data);
        reset({
          name: data.name,
          address: data.address,
          city: data.city,
          totalSeats: data.totalSeats,
          contact: data.contact,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load institute information.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchLibrary();
  }, [reset, toast]);

  const onSubmit = async (data: FormValues) => {
    if (!library) return;
    try {
      const updated = await updateLibrary({
        id: library.id,
        ...data,
      });
      setLibrary(updated);
      updateLibraryMetadata(updated.name, updated.totalSeats);
      toast({
        title: "Success",
        description: "Institute information updated successfully.",
      });
      reset(data); // Mark as clean
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse p-4">
        <div className="h-48 rounded-[2.5rem] bg-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Skeleton className="h-64 rounded-[2rem]" />
          <Skeleton className="h-64 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary border border-primary/20">
              <Settings className="h-3.5 w-3.5" />
              System Configuration
            </div>
            <h1 className="text-4xl font-black md:text-5xl tracking-tight leading-none">
              Institute <span className="text-primary">Profile</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-sm">Manage your library's core identity and operational parameters.</p>
          </div>

          <div className="flex flex-col items-end gap-3">
             <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg">
                  {library?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-black text-lg leading-none">{library?.name}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Operational Since {library ? new Date(library.createdAt).getFullYear() : 'N/A'}</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Identity Card */}
          <Card className="rounded-[2.5rem] border-slate-200/60 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-md overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-slate-800">Basic Identity</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Official naming and contact specifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Institute Name</Label>
                  <div className="relative">
                    <Input {...register("name")} disabled className="h-14 rounded-2xl border-slate-200 pl-4 pr-10 font-bold bg-slate-50/50 cursor-not-allowed opacity-70" />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  </div>
                  {errors.name && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Official Contact No</Label>
                  <div className="relative">
                    <Input {...register("contact")} disabled className="h-14 rounded-2xl border-slate-200 pl-4 pr-10 font-bold bg-slate-50/50 cursor-not-allowed opacity-70" />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  </div>
                  {errors.contact && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.contact.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="rounded-[2.5rem] border-slate-200/60 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-md overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-slate-800">Physical Location</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Geographic and postal deployment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Complete Address</Label>
                  <Input {...register("address")} disabled className="h-14 rounded-2xl border-slate-200 font-bold bg-slate-50/50 cursor-not-allowed opacity-70" />
                  {errors.address && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.address.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">City / Region</Label>
                  <div className="relative">
                    <Input {...register("city")} disabled className="h-14 rounded-2xl border-slate-200 pl-4 pr-10 font-bold bg-slate-50/50 cursor-not-allowed opacity-70" />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  </div>
                  {errors.city && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Total Capacity (Seats)</Label>
                   <div className="relative">
                     <Input type="number" {...register("totalSeats", { valueAsNumber: true })} className="h-14 rounded-2xl border-slate-200 pl-4 pr-10 font-black text-primary" />
                     <Armchair className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                   </div>
                   {errors.totalSeats && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.totalSeats.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
           {/* Sidebar Actions */}
           <Card className="rounded-[2.5rem] border-slate-200/60 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-md overflow-hidden sticky top-24">
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/5">
                    <Gem className="h-10 w-10" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">Manage360 Elite</h4>
                    <p className="text-xs text-slate-400 font-medium">Enterprise License Active</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                   <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <ShieldCheck className="h-5 w-5" />
                      <div className="text-[10px] font-black uppercase tracking-widest">Verified Institute</div>
                   </div>
                   
                   <Button 
                     type="submit" 
                     disabled={isSubmitting || !isDirty} 
                     className="w-full h-16 rounded-2xl bg-slate-950 text-white font-black text-lg gap-3 shadow-2xl hover:bg-primary transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400"
                   >
                     {isSubmitting ? (
                       <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     ) : (
                       <>
                         <Save className="h-5 w-5" />
                         Save Changes
                       </>
                     )}
                   </Button>
                   
                   {!isDirty && (
                     <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-tighter italic">No changes detected in profile.</p>
                   )}
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-tighter">Registration Date</span>
                    <span className="text-slate-800 font-black">{library ? new Date(library.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-tighter">System ID</span>
                    <span className="text-slate-800 font-black truncate max-w-[100px]">{library?.id?.slice(0, 8)}...</span>
                  </div>
                </div>
              </CardContent>
           </Card>

           <div className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 flex flex-col items-center gap-2 text-center">
              <Info className="h-6 w-6 text-slate-300" />
              <p className="text-[10px] text-slate-400 font-medium">Changes to institute information will reflect across all generated invoices and reports immediately.</p>
           </div>
        </div>
      </form>
    </div>
  );
}
