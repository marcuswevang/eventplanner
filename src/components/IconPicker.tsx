"use client";

import {
    Church, Utensils, MapPin, BookOpen, Info, Music, GlassWater,
    Clock, Heart, Star, Sparkles, Mic2, ChefHat, MailCheck,
    Crown, UserRound, Camera, Gift, PartyPopper, Calendar,
    Home, Bell, Coffee, Pizza, Wine, Beer, Cake, Car,
    Plane, Map, Navigation, Phone, Mail, Globe,
    Search, X, Check
} from "lucide-react";

export const ICON_LIBRARY: Record<string, any> = {
    Church, Utensils, MapPin, BookOpen, Info, Music, GlassWater,
    Clock, Heart, Star, Sparkles, Mic2, ChefHat, MailCheck,
    Crown, UserRound, Camera, Gift, PartyPopper, Calendar,
    Home, Bell, Coffee, Pizza, Wine, Beer, Cake, Car,
    Plane, Map, Navigation, Phone, Mail, Globe
};

interface IconPickerProps {
    value: string;
    onChange: (iconName: string) => void;
    onClose: () => void;
}

export default function IconPicker({ value, onChange, onClose }: IconPickerProps) {
    return (
        <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 1000,
            background: '#222',
            border: '1px solid #444',
            borderRadius: '12px',
            padding: '1rem',
            marginTop: '0.5rem',
            width: '280px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600 }}>Velg ikon</span>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                    <X size={16} />
                </button>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '0.5rem',
                maxHeight: '200px',
                overflowY: 'auto',
                paddingRight: '4px'
            }}>
                {Object.entries(ICON_LIBRARY).map(([name, Icon]) => (
                    <button
                        key={name}
                        onClick={(e) => {
                            e.preventDefault();
                            onChange(name);
                            onClose();
                        }}
                        style={{
                            padding: '0.5rem',
                            background: value === name ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                            border: 'none',
                            borderRadius: '6px',
                            color: value === name ? '#000' : '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        title={name}
                    >
                        <Icon size={18} />
                    </button>
                ))}
            </div>
        </div>
    );
}
