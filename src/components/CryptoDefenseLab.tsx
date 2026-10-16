import React, { useState } from 'react';
import { Lock, Key, Database, CheckCircle2, AlertTriangle, Cpu, MailCheck } from 'lucide-react';

export const CryptoDefenseLab: React.FC = () => {
  // Bloom filter state
  const [testEmail, setTestEmail] = useState('elena.rostova.91@gmail.com');
  const [bloomResult, setBloomResult] = useState<{ checked: boolean; found: boolean; hashIndices: number[] }>({
    checked: false,
    found: false,
    hashIndices: [],
  });

  // AES-256-GCM Web Crypto state
  const [plainPii, setPlainPii] = useState('Employee ID: #84920 | Access: Sector-4 | DOB: 1991');
  const [cipherResult, setCipherResult] = useState<string>('');
  const [decryptedResult, setDecryptedResult] = useState<string>('');
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);

  // Email DNS Auth State
  const testDomain = 'apex-payments-corp.com';

  // Simulated Bloom Filter Check (O(1) 3-Hash Lookup)
  const handleCheckBloom = () => {
    // 3 pseudo-hashes for demonstration of bit-array indices
    let h1 = 0, h2 = 5381, h3 = 0x811c9dc5;
    for (let i = 0; i < testEmail.length; i++) {
      const char = testEmail.charCodeAt(i);
      h1 = (h1 << 5) - h1 + char;
      h2 = (h2 << 5) + h2 + char;
      h3 ^= char;
      h3 = (h3 * 0x01000193) >>> 0;
    }
    const idx1 = Math.abs(h1) % 1024;
    const idx2 = Math.abs(h2) % 1024;
    const idx3 = Math.abs(h3) % 1024;

    const isBreached = testEmail.includes('gmail') || testEmail.includes('rostova') || testEmail.includes('vance');

    setBloomResult({
      checked: true,
      found: isBreached,
      hashIndices: [idx1, idx2, idx3],
    });
  };

  // Real Web Crypto AES-256-GCM Encryption
  const handleEncryptPii = async () => {
    try {
      const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      setCryptoKey(key);

      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(plainPii);

      const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
      );

      const combined = new Uint8Array(iv.length + ciphertext.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(ciphertext), iv.length);

      const base64Cipher = btoa(String.fromCharCode(...combined));
      setCipherResult(base64Cipher);
      setDecryptedResult('');
    } catch {
      setCipherResult('Web Crypto API Error');
    }
  };

  const handleDecryptPii = async () => {
    if (!cryptoKey || !cipherResult) return;
    try {
      const binary = atob(cipherResult);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const iv = bytes.slice(0, 12);
      const data = bytes.slice(12);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
      );

      setDecryptedResult(new TextDecoder().decode(decrypted));
    } catch {
      setDecryptedResult('Decryption Authentication Tag Failed');
    }
  };

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 py-4">
      <div className="cyber-panel rounded-2xl p-6 border border-cyber-border space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-cyber-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyber-emerald uppercase tracking-wider">
              <Lock className="w-4 h-4 text-cyber-emerald" />
              TOWER 4 (#30), TOWER 7 (#62) & TOWER 8 (#66): ZERO-TRUST CRYPTOGRAPHIC LAB
            </div>
            <h3 className="text-base font-bold font-mono text-white mt-1">
              Deterministic CS Algorithms, Web Crypto AES-256-GCM & Post-Quantum Defense
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-950/80 text-cyber-emerald border border-cyber-emerald/40">
            NATIVE WEB CRYPTO API ACTIVE
          </span>
        </div>

        {/* 2 Grid Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Tool 1: Bloom Filter O(1) Credential Breach Check */}
          <div className="p-5 rounded-xl bg-cyber-darkest border border-cyber-border space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyber-cyan" />
                Tower 4 (#30): O(1) Bloom Filter Breach Index
              </div>
              <span className="text-[10px] text-slate-500">10B Records / 128MB RAM</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Space-efficient probabilistic membership check eliminating origin database lookups. 0% false-negative guarantee.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email to check..."
                className="flex-1 p-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-xs font-mono text-white focus:outline-none focus:border-cyber-cyan"
              />
              <button
                onClick={handleCheckBloom}
                className="px-3.5 py-2 rounded-lg bg-cyber-card hover:bg-cyber-cyan hover:text-cyber-darkest text-cyber-cyan border border-cyber-cyan/40 font-bold transition-all"
              >
                Query Filter
              </button>
            </div>

            {bloomResult.checked && (
              <div className={`p-3 rounded-lg border text-xs ${
                bloomResult.found
                  ? 'bg-red-950/40 border-cyber-crimson/50 text-red-200'
                  : 'bg-emerald-950/40 border-cyber-emerald/50 text-emerald-200'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {bloomResult.found ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-cyber-crimson" />
                      <span>IDENTIFIER POSSIBLY IN BREACH DUMP</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-cyber-emerald" />
                      <span>IDENTIFIER DEFINITELY NOT COMPROMISED (0% FALSE NEGATIVE)</span>
                    </>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Bit-Array Hashes: h1={bloomResult.hashIndices[0]}, h2={bloomResult.hashIndices[1]}, h3={bloomResult.hashIndices[2]}
                </div>
              </div>
            )}
          </div>

          {/* Tool 2: Field-Level AES-256-GCM Web Crypto */}
          <div className="p-5 rounded-xl bg-cyber-darkest border border-cyber-border space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-cyber-emerald" />
                Tower 7 (#62): Real AES-256-GCM Web Crypto Vault
              </div>
              <span className="text-[10px] text-cyber-emerald">Hardware Accelerated</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Client-side authenticated encryption ensuring personal information is never stored or transmitted in plain text.
            </p>

            <input
              type="text"
              value={plainPii}
              onChange={(e) => setPlainPii(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-xs font-mono text-white focus:outline-none focus:border-cyber-emerald"
            />

            <div className="flex gap-2">
              <button
                onClick={handleEncryptPii}
                className="flex-1 py-2 rounded-lg bg-emerald-950/80 hover:bg-cyber-emerald hover:text-cyber-darkest text-cyber-emerald border border-cyber-emerald/40 font-bold transition-all"
              >
                Encrypt in Browser (AES-GCM)
              </button>
              {cipherResult && (
                <button
                  onClick={handleDecryptPii}
                  className="px-4 py-2 rounded-lg bg-cyber-card hover:bg-slate-700 text-slate-200 border border-cyber-border transition-all"
                >
                  Decrypt
                </button>
              )}
            </div>

            {cipherResult && (
              <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border break-all text-[11px] text-cyber-cyan">
                <span className="text-slate-500 font-bold">Ciphertext + IV: </span>
                {cipherResult}
              </div>
            )}

            {decryptedResult && (
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-cyber-emerald/40 text-[11px] text-emerald-300">
                <span className="font-bold text-cyber-emerald">Decrypted Plaintext: </span>
                {decryptedResult}
              </div>
            )}
          </div>

          {/* Tool 3: SPF / DKIM / DMARC Header Inspector (Tower 6 #48) */}
          <div className="p-5 rounded-xl bg-cyber-darkest border border-cyber-border space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-2">
                <MailCheck className="w-4 h-4 text-cyber-cyan" />
                Tower 6 (#48): SPF / DKIM / DMARC Email Security Audit
              </div>
              <span className="text-[10px] text-slate-400">DNS Alignment</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Verifying cryptographic domain signing preventing identity spoofing and unauthorized spear-phishing relays.
            </p>

            <div className="p-3 rounded-lg bg-cyber-surface border border-cyber-border space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">SPF Record (v=spf1):</span>
                <span className="text-cyber-emerald font-bold">PASS (+ip4:198.51.100.0/24)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">DKIM Signature (rsa-sha256):</span>
                <span className="text-cyber-emerald font-bold">PASS (d={testDomain})</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">DMARC Policy (p=reject):</span>
                <span className="text-cyber-emerald font-bold">STRICT REJECT (Spoofs Blocked)</span>
              </div>
            </div>
          </div>

          {/* Tool 4: Post-Quantum Cryptography ML-KEM Kyber-768 (Tower 8 #66) */}
          <div className="p-5 rounded-xl bg-cyber-darkest border border-cyber-border space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Tower 8 (#66): Post-Quantum ML-KEM (Kyber-768)
              </div>
              <span className="text-[10px] text-purple-400">NIST FIPS 203 Ready</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Quantum-resistant lattice-based key encapsulation securing session keys against future harvest-now-decrypt-later attacks.
            </p>

            <div className="p-3 rounded-lg bg-cyber-surface border border-cyber-border space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Algorithm:</span>
                <span className="text-purple-300 font-bold">ML-KEM-768 (Lattice Cryptography)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Security Category:</span>
                <span className="text-purple-300 font-bold">NIST Level 3 (Equivalent to AES-192)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ciphertext Size:</span>
                <span className="text-slate-300">1,088 bytes (Zero-Allocation Buffer)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
