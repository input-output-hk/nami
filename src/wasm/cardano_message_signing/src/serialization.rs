use super::*;
use std::io::{Seek, SeekFrom};
use linked_hash_map::LinkedHashMap;

impl cbor_event::se::Serialize for ProtectedHeaderMap {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_bytes(&self.0)
    }
}

impl Deserialize for ProtectedHeaderMap {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let bytes = raw.bytes()?;
            if bytes.is_empty() {
                Ok(ProtectedHeaderMap::new_empty())
            } else {
                // can't use from_bytes since error types won't match up on wasm builds otherwise
                let mut bytes_deserializer = Deserializer::from(std::io::Cursor::new(bytes));
                Ok(ProtectedHeaderMap::new(&HeaderMap::deserialize(&mut bytes_deserializer)?))
            }
        })().map_err(|e| e.annotate("ProtectedHeaderMap"))
    }
}

impl cbor_event::se::Serialize for LabelEnum {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        match self {
            LabelEnum::Int(x) => {
                x.serialize(serializer)
            },
            LabelEnum::Text(x) => {
                serializer.write_text(&x)
            },
        }
    }
}

impl Deserialize for LabelEnum {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let initial_position = raw.as_mut_ref().seek(SeekFrom::Current(0)).unwrap();
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(Int::deserialize(raw)?)
            })(raw)
            {
                Ok(variant) => return Ok(LabelEnum::Int(variant)),
                Err(_) => raw.as_mut_ref().seek(SeekFrom::Start(initial_position)).unwrap(),
            };
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(String::deserialize(raw)?)
            })(raw)
            {
                Ok(variant) => return Ok(LabelEnum::Text(variant)),
                Err(_) => raw.as_mut_ref().seek(SeekFrom::Start(initial_position)).unwrap(),
            };
            Err(DeserializeError::new("LabelEnum", DeserializeFailure::NoVariantMatched.into()))
        })().map_err(|e| e.annotate("LabelEnum"))
    }
}

impl cbor_event::se::Serialize for Label {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        self.0.serialize(serializer)
    }
}

impl Deserialize for Label {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Ok(Self(LabelEnum::deserialize(raw)?))
    }
}

impl cbor_event::se::Serialize for Labels {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for Labels {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len { cbor_event::Len::Len(n) => arr.len() < n as usize, cbor_event::Len::Indefinite => true, } {
                if raw.cbor_type()? == cbor_event::Type::Special {
                    assert_eq!(raw.special()?, cbor_event::Special::Break);
                    break;
                }
                arr.push(Label::deserialize(raw)?);
            }
            Ok(())
        })().map_err(|e| e.annotate("Labels"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for COSESignatures {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for COSESignatures {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len { cbor_event::Len::Len(n) => arr.len() < n as usize, cbor_event::Len::Indefinite => true, } {
                if raw.cbor_type()? == cbor_event::Type::Special {
                    assert_eq!(raw.special()?, cbor_event::Special::Break);
                    break;
                }
                arr.push(COSESignature::deserialize(raw)?);
            }
            Ok(())
        })().map_err(|e| e.annotate("COSESignatures"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for CounterSignature {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        if self.0.len() == 1 {
            self.0.0.first().unwrap().serialize(serializer)
        } else {
            self.0.serialize(serializer)
        }
    }
}

impl Deserialize for CounterSignature {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let initial_position = raw.as_mut_ref().seek(SeekFrom::Current(0)).unwrap();
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(COSESignature::deserialize(raw)?)
            })(raw)
            {
                Ok(single_sig) => return Ok(CounterSignature::new_single(&single_sig)),
                Err(_) => raw.as_mut_ref().seek(SeekFrom::Start(initial_position)).unwrap(),
            };
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(COSESignatures::deserialize(raw)?)
            })(raw)
            {
                Ok(multi_sig) => return Ok(CounterSignature::new_multi(&multi_sig)),
                Err(_) => raw.as_mut_ref().seek(SeekFrom::Start(initial_position)).unwrap(),
            };
            Err(DeserializeError::new("CounterSignature", DeserializeFailure::NoVariantMatched.into()))
        })().map_err(|e| e.annotate("CounterSignature"))
    }
}

impl cbor_event::se::Serialize for HeaderMap {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(self.other_headers.len() as u64 + match &self.algorithm_id { Some(_) => 1, None => 0 } + match &self.criticality { Some(_) => 1, None => 0 } + match &self.content_type { Some(_) => 1, None => 0 } + match &self.key_id { Some(_) => 1, None => 0 } + match &self.init_vector { Some(_) => 1, None => 0 } + match &self.partial_init_vector { Some(_) => 1, None => 0 } + match &self.counter_signature { Some(_) => 1, None => 0 }))?;
        if let Some(field) = &self.algorithm_id {
            serializer.write_unsigned_integer(1)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.criticality {
            serializer.write_unsigned_integer(2)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.content_type {
            serializer.write_unsigned_integer(3)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.key_id {
            serializer.write_unsigned_integer(4)?;
            serializer.write_bytes(&field)?;
        }
        if let Some(field) = &self.init_vector {
            serializer.write_unsigned_integer(5)?;
            serializer.write_bytes(&field)?;
        }
        if let Some(field) = &self.partial_init_vector {
            serializer.write_unsigned_integer(6)?;
            serializer.write_bytes(&field)?;
        }
        if let Some(field) = &self.counter_signature {
            serializer.write_unsigned_integer(7)?;
            field.serialize(serializer)?;
        }
        for (key, value) in &self.other_headers {
            key.serialize(serializer)?;
            value.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

fn read_value<R: BufRead + Seek>(raw: &mut Deserializer<R>, other_headers: &mut LinkedHashMap<Label, CBORValue>, label: Label, key: Key) -> Result<(), DeserializeError> {
    let value = CBORValue::deserialize(raw)?;
    match other_headers.insert(label, value) {
        Some(_) => Err(DeserializeFailure::DuplicateKey(key).into()),
        None => Ok(()),
    }
}

impl Deserialize for HeaderMap {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            let mut algorithm_id = None;
            let mut criticality = None;
            let mut content_type = None;
            let mut key_id = None;
            let mut init_vector = None;
            let mut partial_init_vector = None;
            let mut counter_signature = None;
            let mut other_headers = LinkedHashMap::<Label, CBORValue>::new();
            let mut read = 0;
            while match len { cbor_event::Len::Len(n) => read < n as usize, cbor_event::Len::Indefinite => true, } {
                match raw.cbor_type()? {
                    cbor_event::Type::NegativeInteger => {
                        let nint_abs = -raw.negative_integer()? as u64;
                        read_value(
                            raw,
                            &mut other_headers,
                            Label::new_int(&Int::new_negative(to_bignum(nint_abs))),
                            Key::Nint(nint_abs))?;
                    },
                    cbor_event::Type::UnsignedInteger => match raw.unsigned_integer()? {
                        1 =>  {
                            if algorithm_id.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(1)).into());
                            }
                            algorithm_id = Some((|| -> Result<_, DeserializeError> {
                                Ok(Label::deserialize(raw)?)
                            })().map_err(|e| e.annotate("algorithm_id"))?);
                        },
                        2 =>  {
                            if criticality.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(2)).into());
                            }
                            criticality = Some((|| -> Result<_, DeserializeError> {
                                Ok(Labels::deserialize(raw)?)
                            })().map_err(|e| e.annotate("criticality"))?);
                        },
                        3 =>  {
                            if content_type.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(3)).into());
                            }
                            content_type = Some((|| -> Result<_, DeserializeError> {
                                Ok(Label::deserialize(raw)?)
                            })().map_err(|e| e.annotate("content_type"))?);
                        },
                        4 =>  {
                            if key_id.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(4)).into());
                            }
                            key_id = Some((|| -> Result<_, DeserializeError> {
                                Ok(raw.bytes()?)
                            })().map_err(|e| e.annotate("key_id"))?);
                        },
                        5 =>  {
                            if init_vector.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(5)).into());
                            }
                            init_vector = Some((|| -> Result<_, DeserializeError> {
                                Ok(raw.bytes()?)
                            })().map_err(|e| e.annotate("init_vector"))?);
                        },
                        6 =>  {
                            if partial_init_vector.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(6)).into());
                            }
                            partial_init_vector = Some((|| -> Result<_, DeserializeError> {
                                Ok(raw.bytes()?)
                            })().map_err(|e| e.annotate("partial_init_vector"))?);
                        },
                        7 =>  {
                            if counter_signature.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(7)).into());
                            }
                            counter_signature = Some(Box::new((|| -> Result<_, DeserializeError> {
                                Ok(CounterSignature::deserialize(raw)?)
                            })().map_err(|e| e.annotate("counter_signature"))?));
                        },
                        other_key => {
                            let uint = other_key;
                            read_value(
                                raw,
                                &mut other_headers,
                                Label::new_int(&Int::new(to_bignum(uint))),
                                Key::Uint(uint))?;
                        },
                    },
                    cbor_event::Type::Text => {
                        let text = raw.text()?;
                        read_value(
                            raw,
                            &mut other_headers,
                            Label::new_text(text.clone()),
                            Key::Str(text))?;
                    },
                    cbor_event::Type::Special => match raw.special()? {
                        cbor_event::Special::Break => match len {
                            cbor_event::Len::Len(_) => return Err(DeserializeFailure::BreakInDefiniteLen.into()),
                            cbor_event::Len::Indefinite => break,
                        },
                        _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                    },
                    other_type => return Err(DeserializeFailure::UnexpectedKeyType(other_type).into()),
                }
                read += 1;
            }
            Ok(Self {
                algorithm_id,
                criticality,
                content_type,
                key_id,
                init_vector,
                partial_init_vector,
                counter_signature,
                other_headers,
            })
        })().map_err(|e| e.annotate("HeaderMap"))
    }
}

impl cbor_event::se::Serialize for Headers {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for Headers {
    fn serialize_as_embedded_group<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        self.protected.serialize(serializer)?;
        self.unprotected.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for Headers {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(2)?;
            let ret = Self::deserialize_as_embedded_group(raw, &mut read_len, len);
            match len {
                cbor_event::Len::Len(_) => (),
                cbor_event::Len::Indefinite => match raw.special()? {
                    cbor_event::Special::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })().map_err(|e| e.annotate("Headers"))
    }
}

impl DeserializeEmbeddedGroup for Headers {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(raw: &mut Deserializer<R>, _read_len: &mut CBORReadLen, _len: cbor_event::Len) -> Result<Self, DeserializeError> {
        let protected = (|| -> Result<_, DeserializeError> {
            Ok(ProtectedHeaderMap::deserialize(raw)?)
        })().map_err(|e| e.annotate("protected"))?;
        let unprotected = (|| -> Result<_, DeserializeError> {
            Ok(HeaderMap::deserialize(raw)?)
        })().map_err(|e| e.annotate("unprotected"))?;
        Ok(Headers {
            protected,
            unprotected,
        })
    }
}

impl cbor_event::se::Serialize for COSESignature {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.headers.serialize_as_embedded_group(serializer)?;
        serializer.write_bytes(&self.signature)?;
        Ok(serializer)
    }
}

impl Deserialize for COSESignature {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(3)?;
            let headers = (|| -> Result<_, DeserializeError> {
                Ok(Headers::deserialize_as_embedded_group(raw, &mut read_len, len)?)
            })().map_err(|e| e.annotate("headers"))?;
            let signature = (|| -> Result<_, DeserializeError> {
                Ok(raw.bytes()?)
            })().map_err(|e| e.annotate("signature"))?;
            match len {
                cbor_event::Len::Len(_) => (),
                cbor_event::Len::Indefinite => match raw.special()? {
                    cbor_event::Special::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            Ok(COSESignature {
                headers,
                signature,
            })
        })().map_err(|e| e.annotate("COSESignature"))
    }
}

impl cbor_event::se::Serialize for COSESign1 {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.headers.serialize_as_embedded_group(serializer)?;
        match &self.payload {
            Some(x) => {
                serializer.write_bytes(&x)
            },
            None => serializer.write_special(cbor_event::Special::Null),
        }?;
        serializer.write_bytes(&self.signature)?;
        Ok(serializer)
    }
}

impl Deserialize for COSESign1 {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(4)?;
            let headers = (|| -> Result<_, DeserializeError> {
                Ok(Headers::deserialize_as_embedded_group(raw, &mut read_len, len)?)
            })().map_err(|e| e.annotate("headers"))?;
            let payload = (|| -> Result<_, DeserializeError> {
                Ok(match raw.cbor_type()? != cbor_event::Type::Special {
                    true => {
                        Some(raw.bytes()?)
                    },
                    false => {
                        if raw.special()? != cbor_event::Special::Null {
                            return Err(DeserializeFailure::ExpectedNull.into());
                        }
                        None
                    }
                })
            })().map_err(|e| e.annotate("payload"))?;
            let signature = (|| -> Result<_, DeserializeError> {
                Ok(raw.bytes()?)
            })().map_err(|e| e.annotate("signature"))?;
            match len {
                cbor_event::Len::Len(_) => (),
                cbor_event::Len::Indefinite => match raw.special()? {
                    cbor_event::Special::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            Ok(COSESign1 {
                headers,
                payload,
                signature,
            })
        })().map_err(|e| e.annotate("COSESign1"))
    }
}

impl cbor_event::se::Serialize for COSESign {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.headers.serialize_as_embedded_group(serializer)?;
        match &self.payload {
            Some(x) => {
                serializer.write_bytes(&x)
            },
            None => serializer.write_special(cbor_event::Special::Null),
        }?;
        self.signatures.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for COSESign {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(4)?;
            let headers = (|| -> Result<_, DeserializeError> {
                Ok(Headers::deserialize_as_embedded_group(raw, &mut read_len, len)?)
            })().map_err(|e| e.annotate("headers"))?;
            let payload = (|| -> Result<_, DeserializeError> {
                Ok(match raw.cbor_type()? != cbor_event::Type::Special {
                    true => {
                        Some(raw.bytes()?)
                    },
                    false => {
                        if raw.special()? != cbor_event::Special::Null {
                            return Err(DeserializeFailure::ExpectedNull.into());
                        }
                        None
                    }
                })
            })().map_err(|e| e.annotate("payload"))?;
            let signatures = (|| -> Result<_, DeserializeError> {
                Ok(COSESignatures::deserialize(raw)?)
            })().map_err(|e| e.annotate("signatures"))?;
            match len {
                cbor_event::Len::Len(_) => (),
                cbor_event::Len::Indefinite => match raw.special()? {
                    cbor_event::Special::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            Ok(COSESign {
                headers,
                payload,
                signatures,
            })
        })().map_err(|e| e.annotate("COSESign"))
    }
}

impl cbor_event::se::Serialize for SignedMessageEnum {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        match self {
            SignedMessageEnum::COSESIGN(x) => {
                x.serialize(serializer)
            },
            SignedMessageEnum::COSESIGN1(x) => {
                x.serialize(serializer)
            },
        }
    }
}

impl Deserialize for SignedMessageEnum {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let initial_position = raw.as_mut_ref().seek(SeekFrom::Current(0)).unwrap();
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(COSESign::deserialize(raw)?)
            })(raw)
            {
                Ok(variant) => return Ok(SignedMessageEnum::COSESIGN(variant)),
                Err(_) => raw.as_mut_ref().seek(SeekFrom::Start(initial_position)).unwrap(),
            };
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(COSESign1::deserialize(raw)?)
            })(raw)
            {
                Ok(variant) => return Ok(SignedMessageEnum::COSESIGN1(variant)),
                Err(_) => raw.as_mut_ref().seek(SeekFrom::Start(initial_position)).unwrap(),
            };
            Err(DeserializeError::new("SignedMessageEnum", DeserializeFailure::NoVariantMatched.into()))
        })().map_err(|e| e.annotate("SignedMessageEnum"))
    }
}

impl cbor_event::se::Serialize for SignedMessage {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        self.0.serialize(serializer)
    }
}

impl Deserialize for SignedMessage {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Ok(Self(SignedMessageEnum::deserialize(raw)?))
    }
}

impl cbor_event::se::Serialize for SigStructure {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(if self.sign_protected().is_some() {5} else {4}))?;
        let context_str = match self.context {
            SigContext::Signature => "Signature",
            SigContext::Signature1 => "Signature1",
            SigContext::CounterSignature => "CounterSignature",
        };
        serializer.write_text(context_str)?;
        self.body_protected.serialize(serializer)?;
        if let Some(sign_protected) = &self.sign_protected {
            sign_protected.serialize(serializer)?;
        }
        serializer.write_bytes(&self.external_aad)?;
        serializer.write_bytes(&self.payload)?;
        Ok(serializer)
    }
}

impl Deserialize for SigStructure {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let context = (|| -> Result<_, DeserializeError> {
                match raw.text()?.as_str() {
                    "Signature" => Ok(SigContext::Signature),
                    "Signature1" => Ok(SigContext::Signature1),
                    "CounterSignature" => Ok(SigContext::CounterSignature),
                    other => Err(DeserializeFailure::FixedValueMismatch{
                        found: Key::Str(String::from(other)),
                        expected: Key::Str(String::from("Signature, Signature1, or CounterSignature")),
                    }.into())
                }
            })().map_err(|e| e.annotate("context"))?;
            let body_protected = (|| -> Result<_, DeserializeError> {
                Ok(ProtectedHeaderMap::deserialize(raw)?)
            })().map_err(|e| e.annotate("body_protected"))?;
            // due to all 3 fields being binary types and the optional one being the first,
            // we need to read all before we know which strings will be which since we can't
            // check the length in the indefinite case
            let b1: Vec<u8> = raw.bytes().map_err(|e| DeserializeError::new("external_aad", DeserializeFailure::CBOR(e)))?;
            let b2: Vec<u8> = raw.bytes().map_err(|e| DeserializeError::new("payload", DeserializeFailure::CBOR(e)))?;
            let b3 = match len {
                cbor_event::Len::Len(n) => match n {
                    4 => None,
                    5 => Some(raw.bytes().map_err(|e| DeserializeError::new("payload", DeserializeFailure::CBOR(e)))?),
                    n => return Err(DeserializeFailure::DefiniteLenMismatch(n, None).into()),
                },
                cbor_event::Len::Indefinite => match raw.cbor_type()? {
                    // assumed to be Break here - will be tested below
                    cbor_event::Type::Special => None,
                    // assume bytes otherwise since it can't be a break
                    _ => Some(raw.bytes().map_err(|e| DeserializeError::new("payload", DeserializeFailure::CBOR(e)))?),
                },
            };
            let (sign_protected, external_aad, payload) = match b3 {
                Some(bytes) => {
                    // must be inlined since we already read the CBOR bytes portion
                    let map = if b1.is_empty() {
                        ProtectedHeaderMap::new_empty()
                    } else {
                        let mut b1_deserializer = Deserializer::from(std::io::Cursor::new(b1));
                        ProtectedHeaderMap::new(&HeaderMap::deserialize(&mut b1_deserializer)?)
                    };
                    (Some(map), b2, bytes)
                },
                None => (None, b1, b2),
            };
            if len == cbor_event::Len::Indefinite {
                if raw.special()? != cbor_event::Special::Break {
                    return Err(DeserializeFailure::EndingBreakMissing.into());
                }
            }
            Ok(SigStructure {
                context,
                body_protected,
                sign_protected,
                external_aad,
                payload,
            })
        })().map_err(|e| e.annotate("SigStructure"))
    }
}

impl cbor_event::se::Serialize for COSEEncrypt0 {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.headers.serialize_as_embedded_group(serializer)?;
        match &self.ciphertext {
            Some(x) => {
                serializer.write_bytes(&x)
            },
            None => serializer.write_special(cbor_event::Special::Null),
        }?;
        Ok(serializer)
    }
}

impl Deserialize for COSEEncrypt0 {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(3)?;
            let headers = (|| -> Result<_, DeserializeError> {
                Ok(Headers::deserialize_as_embedded_group(raw, &mut read_len, len)?)
            })().map_err(|e| e.annotate("headers"))?;
            let ciphertext = (|| -> Result<_, DeserializeError> {
                Ok(match raw.cbor_type()? != cbor_event::Type::Special {
                    true => {
                        Some(raw.bytes()?)
                    },
                    false => {
                        if raw.special()? != cbor_event::Special::Null {
                            return Err(DeserializeFailure::ExpectedNull.into());
                        }
                        None
                    }
                })
            })().map_err(|e| e.annotate("ciphertext"))?;
            match len {
                cbor_event::Len::Len(_) => (),
                cbor_event::Len::Indefinite => match raw.special()? {
                    cbor_event::Special::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            Ok(COSEEncrypt0 {
                headers,
                ciphertext,
            })
        })().map_err(|e| e.annotate("COSEEncrypt0"))
    }
}

impl cbor_event::se::Serialize for PasswordEncryption {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_tag(16u64)?;
        self.0.serialize(serializer)
    }
}

impl Deserialize for PasswordEncryption {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let tag = raw.tag().map_err(|e| DeserializeError::from(e).annotate("PasswordEncryption"))?;
        if tag != 16 {
            return Err(DeserializeError::new("PasswordEncryption", DeserializeFailure::TagMismatch{ found: tag, expected: 16 }));
        }
        Ok(Self(COSEEncrypt0::deserialize(raw)?))
    }
}

impl cbor_event::se::Serialize for COSERecipients {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for COSERecipients {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len { cbor_event::Len::Len(n) => arr.len() < n as usize, cbor_event::Len::Indefinite => true, } {
                if raw.cbor_type()? == cbor_event::Type::Special {
                    assert_eq!(raw.special()?, cbor_event::Special::Break);
                    break;
                }
                arr.push(COSERecipient::deserialize(raw)?);
            }
            Ok(())
        })().map_err(|e| e.annotate("COSERecipients"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for COSEEncrypt {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.headers.serialize_as_embedded_group(serializer)?;
        match &self.ciphertext {
            Some(x) => {
                serializer.write_bytes(&x)
            },
            None => serializer.write_special(cbor_event::Special::Null),
        }?;
        self.recipients.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for COSEEncrypt {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(4)?;
            let headers = (|| -> Result<_, DeserializeError> {
                Ok(Headers::deserialize_as_embedded_group(raw, &mut read_len, len)?)
            })().map_err(|e| e.annotate("headers"))?;
            let ciphertext = (|| -> Result<_, DeserializeError> {
                Ok(match raw.cbor_type()? != cbor_event::Type::Special {
                    true => {
                        Some(raw.bytes()?)
                    },
                    false => {
                        if raw.special()? != cbor_event::Special::Null {
                            return Err(DeserializeFailure::ExpectedNull.into());
                        }
                        None
                    }
                })
            })().map_err(|e| e.annotate("ciphertext"))?;
            let recipients = (|| -> Result<_, DeserializeError> {
                Ok(COSERecipients::deserialize(raw)?)
            })().map_err(|e| e.annotate("recipients"))?;
            match len {
                cbor_event::Len::Len(_) => (),
                cbor_event::Len::Indefinite => match raw.special()? {
                    cbor_event::Special::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            Ok(COSEEncrypt {
                headers,
                ciphertext,
                recipients,
            })
        })().map_err(|e| e.annotate("COSEEncrypt"))
    }
}

impl cbor_event::se::Serialize for COSERecipient {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.headers.serialize_as_embedded_group(serializer)?;
        match &self.ciphertext {
            Some(x) => {
                serializer.write_bytes(&x)
            },
            None => serializer.write_special(cbor_event::Special::Null),
        }?;
        Ok(serializer)
    }
}

impl Deserialize for COSERecipient {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(3)?;
            let headers = (|| -> Result<_, DeserializeError> {
                Ok(Headers::deserialize_as_embedded_group(raw, &mut read_len, len)?)
            })().map_err(|e| e.annotate("headers"))?;
            let ciphertext = (|| -> Result<_, DeserializeError> {
                Ok(match raw.cbor_type()? != cbor_event::Type::Special {
                    true => {
                        Some(raw.bytes()?)
                    },
                    false => {
                        if raw.special()? != cbor_event::Special::Null {
                            return Err(DeserializeFailure::ExpectedNull.into());
                        }
                        None
                    }
                })
            })().map_err(|e| e.annotate("ciphertext"))?;
            match len {
                cbor_event::Len::Len(_) => (),
                cbor_event::Len::Indefinite => match raw.special()? {
                    cbor_event::Special::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            Ok(COSERecipient {
                headers,
                ciphertext,
            })
        })().map_err(|e| e.annotate("COSERecipient"))
    }
}

impl cbor_event::se::Serialize for PubKeyEncryption {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_tag(96u64)?;
        self.0.serialize(serializer)
    }
}

impl Deserialize for PubKeyEncryption {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let tag = raw.tag().map_err(|e| DeserializeError::from(e).annotate("PubKeyEncryption"))?;
        if tag != 96 {
            return Err(DeserializeError::new("PubKeyEncryption", DeserializeFailure::TagMismatch{ found: tag, expected: 96 }));
        }
        Ok(Self(COSEEncrypt::deserialize(raw)?))
    }
}

impl cbor_event::se::Serialize for COSEKey {
    fn serialize<'se, W: Write>(&self, serializer: &'se mut Serializer<W>) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(self.other_headers.len() as u64 + 1 + match &self.key_id { Some(_) => 1, None => 0 } + match &self.algorithm_id { Some(_) => 1, None => 0 } + match &self.key_ops { Some(_) => 1, None => 0 } + match &self.base_init_vector { Some(_) => 1, None => 0 }))?;
        serializer.write_unsigned_integer(1)?;
        self.key_type.serialize(serializer)?;
        if let Some(field) = &self.key_id {
            serializer.write_unsigned_integer(2)?;
            serializer.write_bytes(&field)?;
        }
        if let Some(field) = &self.algorithm_id {
            serializer.write_unsigned_integer(3)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.key_ops {
            serializer.write_unsigned_integer(4)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.base_init_vector {
            serializer.write_unsigned_integer(5)?;
            serializer.write_bytes(&field)?;
        }
        for (key, value) in &self.other_headers {
            key.serialize(serializer)?;
            value.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for COSEKey {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            let mut key_type = None;
            let mut key_id = None;
            let mut algorithm_id = None;
            let mut key_ops = None;
            let mut base_init_vector = None;
            let mut other_headers = LinkedHashMap::<Label, CBORValue>::new();
            let mut read = 0;
            while match len { cbor_event::Len::Len(n) => read < n as usize, cbor_event::Len::Indefinite => true, } {
                match raw.cbor_type()? {
                    cbor_event::Type::NegativeInteger => {
                        let nint_abs = -raw.negative_integer()? as u64;
                        read_value(
                            raw,
                            &mut other_headers,
                            Label::new_int(&Int::new_negative(to_bignum(nint_abs))),
                            Key::Nint(nint_abs))?;
                    },
                    cbor_event::Type::UnsignedInteger => match raw.unsigned_integer()? {
                        1 =>  {
                            if key_type.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(1)).into());
                            }
                            key_type = Some((|| -> Result<_, DeserializeError> {
                                Ok(Label::deserialize(raw)?)
                            })().map_err(|e| e.annotate("key_type"))?);
                        },
                        2 =>  {
                            if key_id.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(2)).into());
                            }
                            key_id = Some((|| -> Result<_, DeserializeError> {
                                Ok(raw.bytes()?)
                            })().map_err(|e| e.annotate("key_id"))?);
                        },
                        3 =>  {
                            if algorithm_id.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(3)).into());
                            }
                            algorithm_id = Some((|| -> Result<_, DeserializeError> {
                                Ok(Label::deserialize(raw)?)
                            })().map_err(|e| e.annotate("algorithm_id"))?);
                        },
                        4 =>  {
                            if key_ops.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(4)).into());
                            }
                            key_ops = Some((|| -> Result<_, DeserializeError> {
                                Ok(Labels::deserialize(raw)?)
                            })().map_err(|e| e.annotate("key_ops"))?);
                        },
                        5 =>  {
                            if base_init_vector.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(5)).into());
                            }
                            base_init_vector = Some((|| -> Result<_, DeserializeError> {
                                Ok(raw.bytes()?)
                            })().map_err(|e| e.annotate("base_init_vector"))?);
                        },
                        other_key => {
                            let uint = other_key;
                            read_value(
                                raw,
                                &mut other_headers,
                                Label::new_int(&Int::new(to_bignum(uint))),
                                Key::Uint(uint))?;
                        },
                    },
                    cbor_event::Type::Text => {
                        let text = raw.text()?;
                        read_value(
                            raw,
                            &mut other_headers,
                            Label::new_text(text.clone()),
                            Key::Str(text))?;
                    },
                    cbor_event::Type::Special => match raw.special()? {
                        cbor_event::Special::Break => match len {
                            cbor_event::Len::Len(_) => return Err(DeserializeFailure::BreakInDefiniteLen.into()),
                            cbor_event::Len::Indefinite => break,
                        },
                        _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                    },
                    other_type => return Err(DeserializeFailure::UnexpectedKeyType(other_type).into()),
                }
                read += 1;
            }
            match key_type {
                Some(kty) => Ok(Self {
                    key_type: kty,
                    key_id,
                    algorithm_id,
                    key_ops,
                    base_init_vector,
                    other_headers,
                }),
                None => Err(DeserializeFailure::MandatoryFieldMissing(Key::Uint(8)).into()),
            }
        })().map_err(|e| e.annotate("COSEKey"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn print_cbor_types(vec: &Vec<u8>) {
        use cbor_event::Type;
        let mut raw = Deserializer::from(std::io::Cursor::new(vec));
        let mut lens = Vec::new();
        let mut consume_elem = |lens: &mut Vec<cbor_event::Len>| {
            if let Some(len) = lens.last_mut() {
                if let cbor_event::Len::Len(n) = len {
                    *n -= 1;
                }
            };
        };
        let mut reduce_depth = |lens: &mut Vec<cbor_event::Len>| {
            while let Some(cbor_event::Len::Len(0)) = lens.last() {
                lens.pop();
                println!("{}}}", "\t".repeat(lens.len()));
            }
        };
        loop {
            print!("{}", "\t".repeat(lens.len()));
            match raw.cbor_type() {
                Err(_) => break,
                Ok(Type::UnsignedInteger) => {
                    println!("UINT({})", raw.unsigned_integer().unwrap());
                    consume_elem(&mut lens);
                    reduce_depth(&mut lens);
                },
                Ok(Type::NegativeInteger) => {
                    println!("NINT({})", raw.negative_integer().unwrap());
                    consume_elem(&mut lens);
                    reduce_depth(&mut lens);
                },
                Ok(Type::Bytes) => {
                    println!("BYTES({:?})", raw.bytes().unwrap());
                    consume_elem(&mut lens);
                    reduce_depth(&mut lens);
                },
                Ok(Type::Text) => {
                    println!("TEXT({})", raw.text().unwrap());
                    consume_elem(&mut lens);
                    reduce_depth(&mut lens);
                },
                Ok(Type::Array) => {
                    let len = raw.array().unwrap();
                    println!("ARRAY({:?}) {{", len);
                    consume_elem(&mut lens);
                    lens.push(len);
                    if let cbor_event::Len::Len(0) = len {
                        reduce_depth(&mut lens);
                    }
                },
                Ok(Type::Map) => {
                    let len = raw.map().unwrap();
                    println!("MAP({:?}) {{", len);
                    consume_elem(&mut lens);
                    lens.push(match len {
                        cbor_event::Len::Len(n) => cbor_event::Len::Len(2 * n),
                        cbor_event::Len::Indefinite => cbor_event::Len::Indefinite,
                    });
                    if let cbor_event::Len::Len(0) = len {
                        reduce_depth(&mut lens);
                    }
                },
                Ok(Type::Tag) => println!("TAG({})", raw.tag().unwrap()),
                Ok(Type::Special) => {
                    let special = raw.special().unwrap();
                    println!("SPECIAL({:?})", special);
                    if special == cbor_event::Special::Break {
                        if let Some(cbor_event::Len::Indefinite) = lens.last() {
                            lens.pop();
                            reduce_depth(&mut lens);
                        } else {
                            panic!("unexpected break");
                        }
                    } else {
                        consume_elem(&mut lens);
                        reduce_depth(&mut lens);
                    }
                },
            }
        }
    }

    fn deser_test<T: Deserialize + ToBytes + std::fmt::Debug>(orig: T) {
        println!("orig = {:?}", orig);
        print_cbor_types(&orig.to_bytes());
        let deser = T::deserialize(&mut Deserializer::from(std::io::Cursor::new(orig.to_bytes()))).unwrap();
        println!("deser = {:?}", deser);
        assert_eq!(orig.to_bytes(), deser.to_bytes());
    }

    fn label_int(x: i32) -> Label {
        Label::new_int(&Int::new_i32(x))
    }

    fn label_str(s: &str) -> Label {
        Label::new_text(String::from(s))
    }

    #[test]
    fn empty_or_serialized_map_ok_empty() {
        deser_test(ProtectedHeaderMap::new_empty());
    }

    #[test]
    fn empty_or_serialized_map_ok_some() {
        let mut header_map = HeaderMap::new();
        header_map.set_algorithm_id(&label_int(199));
        header_map.set_partial_init_vector(vec![0u8, 1u8, 2u8]);
        deser_test(ProtectedHeaderMap::new(&header_map));
    }

    #[test]
    fn empty_or_serialized_map_err() {
        let non_header_bytes = {
            let mut buf = Serializer::new_vec();
            buf.write_bytes(&[100u8; 9]).unwrap();
            buf.finalize()
        };
        assert_eq!(ProtectedHeaderMap::from_bytes(non_header_bytes).unwrap_err().location.unwrap(), "ProtectedHeaderMap.HeaderMap");
    }

    #[test]
    fn header_map() {
        let mut header_map = HeaderMap::new();
        header_map.set_algorithm_id(&label_int(0));
        let mut crit = Labels::new();
        crit.add(&label_int(-166));
        crit.add(&label_str("dsfdsf8353jh5  fsdfd!%&#%3j"));
        header_map.set_criticality(&crit);
        header_map.set_content_type(&label_str("content-type"));
        header_map.set_key_id(vec![34u8; 32]);
        header_map.set_init_vector(vec![97u8; 16]);
        header_map.set_partial_init_vector(vec![5u8; 13]);
        let counter_sig = {
            let mut hm = HeaderMap::new();
            hm.set_key_id(vec![7u8; 7]);
            hm.set_content_type(&label_int(-9));
            let h = Headers::new(&ProtectedHeaderMap::new(&hm), &hm);
            let s = COSESignature::new(&h, vec![87u8; 74]);
            CounterSignature::new_single(&s)
        };
        header_map.set_counter_signature(&counter_sig);
        header_map.set_header(&label_str("i am a string key"), &CBORValue::new_text(String::from("also a string")));
        header_map.set_header(&label_int(-6), &CBORValue::new_tagged(&TaggedCBOR::new(to_bignum(3u64), &CBORValue::new_special(&CBORSpecial::new_null()))));
        deser_test(header_map);
    }

    #[test]
    fn cose_sign() {
        let mut header_map = HeaderMap::new();
        header_map.set_content_type(&label_int(-1000));
        let headers = Headers::new(&ProtectedHeaderMap::new_empty(), &header_map);
        let mut sigs = COSESignatures::new();
        sigs.add(&COSESignature::new(&headers, vec![57u8; 37]));
        let payload = COSESign::new(&headers, Some(vec![64u8; 39]), &sigs);
        let no_payload = COSESign::new(&headers, None, &sigs);
        deser_test(payload);
        deser_test(no_payload);
    }


    #[test]
    fn cose_sign1() {
        let mut header_map = HeaderMap::new();
        header_map.set_content_type(&label_int(-1000));
        let headers = Headers::new(&ProtectedHeaderMap::new_empty(), &header_map);
        let payload = COSESign1::new(&headers, Some(vec![64u8; 39]), vec![1u8, 2u8, 100u8]);
        let no_payload = COSESign1::new(&headers, None, vec![1u8, 2u8, 100u8]);
        deser_test(payload);
        deser_test(no_payload);
    }

    #[test]
    fn sig_structure_sign() {
        let mut sig_struct = SigStructure::new(
            SigContext::Signature,
            &ProtectedHeaderMap::new_empty(),
            vec![8u8, 9u8, 100u8],
            vec![73u8; 23]);
        sig_struct.set_sign_protected(&ProtectedHeaderMap::new_empty());
        deser_test(sig_struct);
    }

    #[test]
    fn sig_structure_counter() {
        let mut sig_struct = SigStructure::new(
            SigContext::CounterSignature,
            &ProtectedHeaderMap::new_empty(),
            vec![8u8, 9u8, 100u8],
            vec![73u8; 23]);
        sig_struct.set_sign_protected(&ProtectedHeaderMap::new_empty());
        deser_test(sig_struct);
    }

    #[test]
    fn sig_structure_sign1() {
        let sig_struct = SigStructure::new(
            SigContext::Signature1,
            &ProtectedHeaderMap::new_empty(),
            vec![8u8, 9u8, 100u8],
            vec![73u8; 23]);
        deser_test(sig_struct);
    }

    #[test]
    fn cose_key() {
        let mut cose_key = COSEKey::new(&label_int(8));
        cose_key.set_algorithm_id(&label_str("fdsfdsf"));
        cose_key.set_base_init_vector(vec![9; 5]);
        cose_key.set_key_id(vec![]);
        let mut key_ops = Labels::new();
        key_ops.add(&label_str("sadsddfd"));
        key_ops.add(&label_int(-100));
        cose_key.set_key_ops(&key_ops);
        cose_key.set_header(&label_str("dsfdsf"), &CBORValue::new_int(&Int::new_i32(-100)));
        cose_key.set_header(&label_int(-50), &CBORValue::new_text(String::from("134da2234fdsfd")));
        deser_test(cose_key);
    }

    #[test]
    fn counter_sig() {
        let mut prot = HeaderMap::new();
        prot.set_init_vector(vec![5u8; 96]);
        prot.set_algorithm_id(&label_str("some algo"));
        let mut unprot = HeaderMap::new();
        unprot.set_key_id(vec![3u8, 5u8, 9u8, 13u8, 19u8, 23u8]);
        let headers = Headers::new(&ProtectedHeaderMap::new(&prot), &unprot);
    
        let sig1 = COSESignature::new(&headers, vec![1u8, 5u8, 100u8, 23u8, 32u8, 16u8, 8u8, 64u8, 96u8, 54u8]);    
        let cs1 = CounterSignature::new_single(&sig1);
        assert_eq!(CounterSignature::from_bytes(cs1.to_bytes()).unwrap().signatures().len(), 1);
        deser_test(cs1);

        let sig2 = COSESignature::new(&headers, vec![55u8; 43]);
        let mut sigs = COSESignatures::new();
        sigs.add(&sig1);
        sigs.add(&sig2);
        let cs2 = CounterSignature::new_multi(&sigs);
        
        assert_eq!(CounterSignature::from_bytes(cs2.to_bytes()).unwrap().signatures().len(), 2);
        deser_test(cs2);
    }
}
