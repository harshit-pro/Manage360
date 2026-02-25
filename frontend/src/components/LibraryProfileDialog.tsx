import { useEffect, useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Building2, MapPin, Phone, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { getCurrentLibrary, updateLibrary, Library } from "@/lib/library";

export function LibraryProfileDialog({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (v: boolean) => void;
}) {
    const { toast } = useToast();

    const [library, setLibrary] = useState<Library | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Editable fields
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [contact, setContact] = useState("");
    const [totalSeats, setTotalSeats] = useState<number | "">("");

    // Load library data when dialog opens
    useEffect(() => {
        if (!open) return;
        setLoading(true);
        getCurrentLibrary()
            .then((data) => {
                setLibrary(data);
                setName(data.name ?? "");
                setAddress(data.address ?? "");
                setCity(data.city ?? "");
                setContact(data.contact ?? "");
                setTotalSeats(data.totalSeats ?? "");
            })
            .catch(() =>
                toast({
                    title: "Error",
                    description: "Failed to load library profile",
                    variant: "destructive",
                })
            )
            .finally(() => setLoading(false));
    }, [open]);

    const handleSave = async () => {
        if (!library) return;

        // Validate seats
        const seats = Number(totalSeats);
        if (totalSeats !== "" && (isNaN(seats) || seats < 1)) {
            toast({ title: "Invalid", description: "Total seats must be a positive number", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            const updated = await updateLibrary({
                id: library.id,
                name,
                address,
                city,
                contact,
                totalSeats: totalSeats !== "" ? seats : undefined,
            });
            setLibrary(updated);
            toast({ title: "Saved ✓", description: "Library profile updated successfully." });
            setOpen(false);
        } catch {
            toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        <Building2 className="h-5 w-5 text-primary" />
                        Library Profile
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : library ? (
                    <div className="space-y-5 py-2">

                        {/* Library Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="lib-name" className="flex items-center gap-1.5 text-sm font-medium">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                Library Name
                            </Label>
                            <Input
                                id="lib-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Chanakya Library"
                            />
                        </div>

                        {/* City + Total Seats — side by side */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="lib-city" className="flex items-center gap-1.5 text-sm font-medium">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                    City
                                </Label>
                                <Input
                                    id="lib-city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="e.g. Bhopal"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="lib-seats" className="flex items-center gap-1.5 text-sm font-medium">
                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                    Total Seats
                                </Label>
                                <Input
                                    id="lib-seats"
                                    type="number"
                                    min={1}
                                    value={totalSeats}
                                    onChange={(e) =>
                                        setTotalSeats(e.target.value === "" ? "" : Number(e.target.value))
                                    }
                                    placeholder="e.g. 60"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <Label htmlFor="lib-address" className="flex items-center gap-1.5 text-sm font-medium">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                Address
                            </Label>
                            <Input
                                id="lib-address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Street, area, pincode"
                            />
                        </div>

                        {/* Contact */}
                        <div className="space-y-1.5">
                            <Label htmlFor="lib-contact" className="flex items-center gap-1.5 text-sm font-medium">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                Contact
                            </Label>
                            <Input
                                id="lib-contact"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                placeholder="Phone or email"
                            />
                        </div>

                        {/* Read-only: Member Since */}
                        {library.createdAt && (
                            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 shrink-0" />
                                <span>
                                    Member since{" "}
                                    <span className="font-medium text-foreground">
                                        {format(new Date(library.createdAt), "dd MMM yyyy")}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                ) : null}

                <DialogFooter className="gap-2 pt-2">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || loading || !library}
                        className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                        {saving ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                        ) : (
                            <><Save className="mr-2 h-4 w-4" />Save Changes</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
