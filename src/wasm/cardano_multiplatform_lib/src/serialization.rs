use super::*;
use crate::utils::*;
use address::*;
use crypto::*;
use error::*;
use std::io::{Seek, SeekFrom};

// This file was code-generated using an experimental CDDL to rust tool:
// https://github.com/Emurgo/cddl-codegen

impl cbor_event::se::Serialize for UnitInterval {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_tag(30u64)?;
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.numerator.serialize(serializer)?;
        self.denominator.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for UnitInterval {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let tag = raw.tag()?;
            if tag != 30 {
                return Err(DeserializeError::new(
                    "UnitInterval",
                    DeserializeFailure::TagMismatch {
                        found: tag,
                        expected: 30,
                    },
                ));
            }
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("UnitInterval"))
    }
}

impl DeserializeEmbeddedGroup for UnitInterval {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let numerator = (|| -> Result<_, DeserializeError> { Ok(BigNum::deserialize(raw)?) })()
            .map_err(|e| e.annotate("numerator"))?;
        let denominator = (|| -> Result<_, DeserializeError> { Ok(BigNum::deserialize(raw)?) })()
            .map_err(|e| e.annotate("denominator"))?;
        Ok(UnitInterval {
            numerator,
            denominator,
        })
    }
}

impl cbor_event::se::Serialize for Transaction {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.body.serialize(serializer)?;
        self.witness_set.serialize(serializer)?;
        serializer.write_special(CBORSpecial::Bool(self.is_valid))?;
        match &self.auxiliary_data {
            Some(x) => x.serialize(serializer),
            None => serializer.write_special(CBORSpecial::Null),
        }?;
        Ok(serializer)
    }
}

impl Deserialize for Transaction {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("Transaction"))
    }
}

impl DeserializeEmbeddedGroup for Transaction {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let body = (|| -> Result<_, DeserializeError> { Ok(TransactionBody::deserialize(raw)?) })()
            .map_err(|e| e.annotate("body"))?;
        let witness_set =
            (|| -> Result<_, DeserializeError> { Ok(TransactionWitnessSet::deserialize(raw)?) })()
                .map_err(|e| e.annotate("witness_set"))?;
        let mut checked_auxiliary_data = false;
        let mut auxiliary_data = None;
        let is_valid = (|| -> Result<_, DeserializeError> {
            match raw.cbor_type()? == CBORType::Special {
                true => {
                    // if it's special it can be either a bool or null. if it's null, then it's empty auxiliary data, otherwise not a valid encoding
                    let special = raw.special()?;
                    if let CBORSpecial::Bool(b) = special {
                        return Ok(b);
                    } else if special == CBORSpecial::Null {
                        checked_auxiliary_data = true;
                        return Ok(true);
                    } else {
                        return Err(DeserializeFailure::ExpectedBool.into());
                    }
                }
                false => {
                    // if no special symbol was detected, it must have auxiliary data
                    auxiliary_data = (|| -> Result<_, DeserializeError> {
                        Ok(Some(AuxiliaryData::deserialize(raw)?))
                    })()
                    .map_err(|e| e.annotate("auxiliary_data"))?;
                    checked_auxiliary_data = true;
                    return Ok(true);
                }
            }
        })()
        .map_err(|e| e.annotate("is_valid"))?;
        if !checked_auxiliary_data {
            // this branch is reached, if the 3rd argument was a bool. then it simply follows the rules for checking auxiliary data
            auxiliary_data = (|| -> Result<_, DeserializeError> {
                Ok(match raw.cbor_type()? != CBORType::Special {
                    true => Some(AuxiliaryData::deserialize(raw)?),
                    false => {
                        if raw.special()? != CBORSpecial::Null {
                            return Err(DeserializeFailure::ExpectedNull.into());
                        }
                        None
                    }
                })
            })()
            .map_err(|e| e.annotate("auxiliary_data"))?;
        }
        Ok(Transaction {
            body,
            witness_set,
            is_valid,
            auxiliary_data,
        })
    }
}

impl cbor_event::se::Serialize for TransactionInputs {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for TransactionInputs {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(TransactionInput::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("TransactionInputs"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for TransactionOutputs {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for TransactionOutputs {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(TransactionOutput::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("TransactionOutputs"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for Certificates {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for Certificates {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(Certificate::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("Certificates"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for TransactionBody {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        if let Some(b) = &self.original_bytes {
            return serializer.write_raw_bytes(b);
        }

        serializer.write_map(cbor_event::Len::Len(
            3 + match &self.ttl {
                Some(_) => 1,
                None => 0,
            } + match &self.certs {
                Some(_) => 1,
                None => 0,
            } + match &self.withdrawals {
                Some(_) => 1,
                None => 0,
            } + match &self.update {
                Some(_) => 1,
                None => 0,
            } + match &self.auxiliary_data_hash {
                Some(_) => 1,
                None => 0,
            } + match &self.validity_start_interval {
                Some(_) => 1,
                None => 0,
            } + match &self.mint {
                Some(_) => 1,
                None => 0,
            } + match &self.script_data_hash {
                Some(_) => 1,
                None => 0,
            } + match &self.collateral {
                Some(_) => 1,
                None => 0,
            } + match &self.required_signers {
                Some(_) => 1,
                None => 0,
            } + match &self.network_id {
                Some(_) => 1,
                None => 0,
            } + match &self.collateral_return {
                Some(_) => 1,
                None => 0,
            } + match &self.total_collateral {
                Some(_) => 1,
                None => 0,
            } + match &self.reference_inputs {
                Some(_) => 1,
                None => 0,
            } + match &self.voting_procedures {
                Some(_) => 1,
                None => 0,
            } + match &self.proposal_procedures {
                Some(_) => 1,
                None => 0,
            },
        ))?;
        serializer.write_unsigned_integer(0)?;
        self.inputs.serialize(serializer)?;
        serializer.write_unsigned_integer(1)?;
        self.outputs.serialize(serializer)?;
        serializer.write_unsigned_integer(2)?;
        self.fee.serialize(serializer)?;
        if let Some(field) = &self.ttl {
            serializer.write_unsigned_integer(3)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.certs {
            serializer.write_unsigned_integer(4)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.withdrawals {
            serializer.write_unsigned_integer(5)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.update {
            serializer.write_unsigned_integer(6)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.auxiliary_data_hash {
            serializer.write_unsigned_integer(7)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.validity_start_interval {
            serializer.write_unsigned_integer(8)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.mint {
            serializer.write_unsigned_integer(9)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.script_data_hash {
            serializer.write_unsigned_integer(11)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.collateral {
            serializer.write_unsigned_integer(13)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.required_signers {
            serializer.write_unsigned_integer(14)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.network_id {
            serializer.write_unsigned_integer(15)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.collateral_return {
            serializer.write_unsigned_integer(16)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.total_collateral {
            serializer.write_unsigned_integer(17)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.reference_inputs {
            serializer.write_unsigned_integer(18)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.voting_procedures {
            serializer.write_unsigned_integer(19)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.proposal_procedures {
            serializer.write_unsigned_integer(20)?;
            field.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for TransactionBody {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let before = raw.as_mut_ref().seek(SeekFrom::Current(0)).unwrap();

            let len = raw.map()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(3)?;
            let mut inputs = None;
            let mut outputs = None;
            let mut fee = None;
            let mut ttl = None;
            let mut certs = None;
            let mut withdrawals = None;
            let mut update = None;
            let mut auxiliary_data_hash = None;
            let mut validity_start_interval = None;
            let mut mint = None;
            let mut script_data_hash = None;
            let mut collateral = None;
            let mut required_signers = None;
            let mut network_id = None;
            let mut collateral_return = None;
            let mut total_collateral = None;
            let mut reference_inputs = None;
            let mut voting_procedures = None;
            let mut proposal_procedures = None;

            let mut read = 0;
            while match len {
                cbor_event::Len::Len(n) => read < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                match raw.cbor_type()? {
                    CBORType::UnsignedInteger => match raw.unsigned_integer()? {
                        0 => {
                            if inputs.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(0)).into());
                            }
                            inputs = Some(
                                (|| -> Result<_, DeserializeError> {
                                    Ok(TransactionInputs::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("inputs"))?,
                            );
                        }
                        1 => {
                            if outputs.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(1)).into());
                            }
                            outputs = Some(
                                (|| -> Result<_, DeserializeError> {
                                    Ok(TransactionOutputs::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("outputs"))?,
                            );
                        }
                        2 => {
                            if fee.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(2)).into());
                            }
                            fee =
                                Some(
                                    (|| -> Result<_, DeserializeError> {
                                        Ok(Coin::deserialize(raw)?)
                                    })()
                                    .map_err(|e| e.annotate("fee"))?,
                                );
                        }
                        3 => {
                            if ttl.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(3)).into());
                            }
                            ttl = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Slot::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("ttl"))?,
                            );
                        }
                        4 => {
                            if certs.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(4)).into());
                            }
                            certs = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Certificates::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("certs"))?,
                            );
                        }
                        5 => {
                            if withdrawals.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(5)).into());
                            }
                            withdrawals = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Withdrawals::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("withdrawals"))?,
                            );
                        }
                        6 => {
                            if update.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(6)).into());
                            }
                            update = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Update::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("update"))?,
                            );
                        }
                        7 => {
                            if auxiliary_data_hash.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(7)).into());
                            }
                            auxiliary_data_hash = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(AuxiliaryDataHash::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("auxiliary_data_hash"))?,
                            );
                        }
                        8 => {
                            if validity_start_interval.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(8)).into());
                            }
                            validity_start_interval = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Slot::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("validity_start_interval"))?,
                            );
                        }
                        9 => {
                            if mint.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(9)).into());
                            }
                            mint = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Mint::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("mint"))?,
                            );
                        }
                        11 => {
                            if script_data_hash.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(11)).into());
                            }
                            script_data_hash = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(ScriptDataHash::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("script_data_hash"))?,
                            );
                        }
                        13 => {
                            if collateral.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(13)).into());
                            }
                            collateral = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(TransactionInputs::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("collateral"))?,
                            );
                        }
                        14 => {
                            if required_signers.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(14)).into());
                            }
                            required_signers = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(RequiredSigners::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("required_signers"))?,
                            );
                        }
                        15 => {
                            if network_id.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(15)).into());
                            }
                            network_id = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(NetworkId::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("network_id"))?,
                            );
                        }
                        16 => {
                            if collateral_return.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(15)).into());
                            }
                            collateral_return = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(TransactionOutput::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("collateral_return"))?,
                            );
                        }
                        17 => {
                            if total_collateral.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(15)).into());
                            }
                            total_collateral = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Coin::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("total_collateral"))?,
                            );
                        }
                        18 => {
                            if reference_inputs.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(15)).into());
                            }
                            reference_inputs = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(TransactionInputs::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("reference_inputs"))?,
                            );
                        }
                        19 => {
                            if voting_procedures.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(15)).into());
                            }
                            voting_procedures = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(VotingProcedures::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("voting_procedures"))?,
                            );
                        }
                        20 => {
                            if proposal_procedures.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(15)).into());
                            }
                            proposal_procedures = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(ProposalProcedures::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("proposal_procedures"))?,
                            );
                        }
                        unknown_key => {
                            return Err(
                                DeserializeFailure::UnknownKey(Key::Uint(unknown_key)).into()
                            )
                        }
                    },
                    CBORType::Text => match raw.text()?.as_str() {
                        unknown_key => {
                            return Err(DeserializeFailure::UnknownKey(Key::Str(
                                unknown_key.to_owned(),
                            ))
                            .into())
                        }
                    },
                    CBORType::Special => match len {
                        cbor_event::Len::Len(_) => {
                            return Err(DeserializeFailure::BreakInDefiniteLen.into())
                        }
                        cbor_event::Len::Indefinite => match raw.special()? {
                            CBORSpecial::Break => break,
                            _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                        },
                    },
                    other_type => {
                        return Err(DeserializeFailure::UnexpectedKeyType(other_type).into())
                    }
                }
                read += 1;
            }
            let inputs = match inputs {
                Some(x) => x,
                None => return Err(DeserializeFailure::MandatoryFieldMissing(Key::Uint(0)).into()),
            };
            let outputs = match outputs {
                Some(x) => x,
                None => return Err(DeserializeFailure::MandatoryFieldMissing(Key::Uint(1)).into()),
            };
            let fee = match fee {
                Some(x) => x,
                None => return Err(DeserializeFailure::MandatoryFieldMissing(Key::Uint(2)).into()),
            };
            read_len.finish()?;

            let after = raw.as_mut_ref().seek(SeekFrom::Current(0)).unwrap();
            let bytes_read = (after - before) as usize;

            raw.as_mut_ref().seek(SeekFrom::Start(before)).unwrap();
            let original_bytes = raw.as_mut_ref().fill_buf().unwrap()[..bytes_read].to_vec();
            raw.as_mut_ref().consume(bytes_read);

            Ok(Self {
                original_bytes: Some(original_bytes),

                inputs,
                outputs,
                fee,
                ttl,
                certs,
                withdrawals,
                update,
                auxiliary_data_hash,
                validity_start_interval,
                mint,
                script_data_hash,
                collateral,
                required_signers,
                network_id,
                collateral_return,
                total_collateral,
                reference_inputs,
                voting_procedures,
                proposal_procedures,
            })
        })()
        .map_err(|e| e.annotate("TransactionBody"))
    }
}

impl cbor_event::se::Serialize for TransactionInput {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.transaction_id.serialize(serializer)?;
        self.index.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for TransactionInput {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("TransactionInput"))
    }
}

impl DeserializeEmbeddedGroup for TransactionInput {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let transaction_id =
            (|| -> Result<_, DeserializeError> { Ok(TransactionHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("transaction_id"))?;
        let index =
            (|| -> Result<_, DeserializeError> { Ok(TransactionIndex::deserialize(raw)?) })()
                .map_err(|e| e.annotate("index"))?;
        Ok(TransactionInput {
            transaction_id,
            index,
        })
    }
}

impl cbor_event::se::Serialize for TransactionOutput {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        if match &self.datum {
            Some(d) => d.kind() == DatumKind::Hash,
            None => true,
        } && self.script_ref.is_none()
        {
            // legacy format

            serializer.write_array(cbor_event::Len::Len(if self.datum.is_some() {
                3
            } else {
                2
            }))?;
            self.address.serialize(serializer)?;
            self.amount.serialize(serializer)?;
            if let Some(data_hash) = self.datum.as_ref().and_then(|datum| datum.as_data_hash()) {
                data_hash.serialize(serializer)?;
            }
        } else {
            // post alonzo

            serializer.write_map(cbor_event::Len::Len(
                2 + match &self.datum {
                    Some(_) => 1,
                    None => 0,
                } + match &self.script_ref {
                    Some(_) => 1,
                    None => 0,
                },
            ))?;

            serializer.write_unsigned_integer(0)?;
            self.address.serialize(serializer)?;

            serializer.write_unsigned_integer(1)?;
            self.amount.serialize(serializer)?;

            if let Some(datum) = &self.datum {
                serializer.write_unsigned_integer(2)?;
                datum.serialize(serializer)?;
            }

            if let Some(script_ref) = &self.script_ref {
                serializer.write_unsigned_integer(3)?;
                script_ref.serialize(serializer)?;
            }
        }

        Ok(serializer)
    }
}

// this is used when deserializing it on its own, but the more likely case
// is when it's done via TransactionOutputs
impl Deserialize for TransactionOutput {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let ret = Self::deserialize_as_embedded_group(raw, cbor_event::Len::Len(0)); // length has no effect
            ret
        })()
        .map_err(|e| e.annotate("TransactionOutput"))
    }
}

// this is used by both TransactionOutput (on its own)'s deserialize
// but also for TransactionOutputs
// This implementation was hand-coded since cddl-codegen doesn't support deserialization
// with array-encoded types with optional fields, due to the complexity.
// This is made worse as this is a plain group...
impl DeserializeEmbeddedGroup for TransactionOutput {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let len: cbor_event::Len;
        let result = match raw.cbor_type()? {
            cbor_event::Type::Array => {
                // legacy output format
                len = raw.array()?;
                let address =
                    (|| -> Result<_, DeserializeError> { Ok(Address::deserialize(raw)?) })()
                        .map_err(|e| e.annotate("address"))?;
                let amount = (|| -> Result<_, DeserializeError> { Ok(Value::deserialize(raw)?) })()
                    .map_err(|e| e.annotate("amount"))?;
                // there are only two cases so far where this is used:
                // 1) on its own inside of TransactionOutput's Deserialize trait (only used if someone calls to_bytes() on it)
                // 2) from TransactionOutput's deserialization
                // in 1) we would encounter an array-end (or track it for definite deserialization - which we don't do right now)
                // and in 2) we would encounter the same OR we would encounter the next TransactionOutput in the array
                // Unfortunately, both address and data hash are bytes type, so we can't just check the type, but instead
                // must check the length, and backtrack if that wasn't the case.
                let data_hash = match raw.cbor_type() {
                Ok(cbor_event::Type::Bytes) => {
                    let initial_position = raw.as_mut_ref().seek(SeekFrom::Current(0)).unwrap();
                    let bytes = raw.bytes().unwrap();
                    if bytes.len() == DataHash::BYTE_COUNT {
                        Some(DataHash(bytes[..DataHash::BYTE_COUNT].try_into().unwrap()))
                    } else {
                        // This is an address of the next output in sequence, which luckily is > 32 bytes so there's no confusion
                        // Go to previous place in array then carry on
                        raw.as_mut_ref().seek(SeekFrom::Start(initial_position)).unwrap();
                        None
                    }
                },
                // not possibly a data hash
                Ok(_) |
                // end of input
                Err(_) => None,
            };
                Ok(TransactionOutput {
                    format: 0,
                    address,
                    amount,
                    datum: match data_hash {
                        Some(h) => Some(Datum::new_data_hash(&h)),
                        None => None,
                    },
                    script_ref: None,
                })
            }
            cbor_event::Type::Map => {
                // post alonzo transaction output format
                len = raw.map()?;
                let mut read_len = CBORReadLen::new(len.clone());
                read_len.read_elems(2)?;
                let mut read = 0;

                let mut address = None;
                let mut amount = None;
                let mut datum = None;
                let mut script_ref = None;

                while match len {
                    cbor_event::Len::Len(n) => read < n as usize,
                    cbor_event::Len::Indefinite => true,
                } {
                    match raw.cbor_type()? {
                        CBORType::UnsignedInteger => match raw.unsigned_integer()? {
                            0 => {
                                if address.is_some() {
                                    return Err(
                                        DeserializeFailure::DuplicateKey(Key::Uint(0)).into()
                                    );
                                }
                                address = Some(
                                    (|| -> Result<_, DeserializeError> {
                                        Ok(Address::deserialize(raw)?)
                                    })()
                                    .map_err(|e| e.annotate("address"))?,
                                );
                            }
                            1 => {
                                if amount.is_some() {
                                    return Err(
                                        DeserializeFailure::DuplicateKey(Key::Uint(0)).into()
                                    );
                                }
                                amount = Some(
                                    (|| -> Result<_, DeserializeError> {
                                        Ok(Value::deserialize(raw)?)
                                    })()
                                    .map_err(|e| e.annotate("amount"))?,
                                );
                            }
                            2 => {
                                if datum.is_some() {
                                    return Err(
                                        DeserializeFailure::DuplicateKey(Key::Uint(0)).into()
                                    );
                                }
                                datum = Some(
                                    (|| -> Result<_, DeserializeError> {
                                        read_len.read_elems(1)?;
                                        Ok(Datum::deserialize(raw)?)
                                    })()
                                    .map_err(|e| e.annotate("datum"))?,
                                );
                            }
                            3 => {
                                if script_ref.is_some() {
                                    return Err(
                                        DeserializeFailure::DuplicateKey(Key::Uint(0)).into()
                                    );
                                }
                                script_ref = Some(
                                    (|| -> Result<_, DeserializeError> {
                                        read_len.read_elems(1)?;
                                        Ok(ScriptRef::deserialize(raw)?)
                                    })()
                                    .map_err(|e| e.annotate("script_ref"))?,
                                );
                            }
                            unknown_key => {
                                return Err(
                                    DeserializeFailure::UnknownKey(Key::Uint(unknown_key)).into()
                                )
                            }
                        },
                        CBORType::Text => match raw.text()?.as_str() {
                            unknown_key => {
                                return Err(DeserializeFailure::UnknownKey(Key::Str(
                                    unknown_key.to_owned(),
                                ))
                                .into())
                            }
                        },
                        CBORType::Special => match len {
                            cbor_event::Len::Len(_) => {
                                return Err(DeserializeFailure::BreakInDefiniteLen.into())
                            }
                            cbor_event::Len::Indefinite => match raw.special()? {
                                CBORSpecial::Break => break,
                                _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                            },
                        },
                        other_type => {
                            return Err(DeserializeFailure::UnexpectedKeyType(other_type).into())
                        }
                    }
                    read += 1;
                }

                let address = match address {
                    Some(x) => x,
                    None => {
                        return Err(DeserializeFailure::MandatoryFieldMissing(Key::Uint(0)).into())
                    }
                };
                let amount = match amount {
                    Some(x) => x,
                    None => {
                        return Err(DeserializeFailure::MandatoryFieldMissing(Key::Uint(1)).into())
                    }
                };
                read_len.finish()?;

                Ok(TransactionOutput {
                    format: 1,
                    address,
                    amount,
                    datum,
                    script_ref,
                })
            }
            _ => return Err(DeserializeFailure::NoVariantMatched.into()),
        };

        match len {
            cbor_event::Len::Len(_) =>
            /* TODO: check finite len somewhere */
            {
                ()
            }
            cbor_event::Len::Indefinite => match raw.special()? {
                CBORSpecial::Break =>
                /* it's ok */
                {
                    ()
                }
                _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
            },
        }

        result
    }
}

impl cbor_event::se::Serialize for StakeRegistration {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for StakeRegistration {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(0u64)?;
        self.stake_credential.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for StakeRegistration {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("StakeRegistration"))
    }
}

impl DeserializeEmbeddedGroup for StakeRegistration {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 0 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(0),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let stake_credential =
            (|| -> Result<_, DeserializeError> { Ok(StakeCredential::deserialize(raw)?) })()
                .map_err(|e| e.annotate("stake_credential"))?;
        Ok(StakeRegistration { stake_credential })
    }
}

impl cbor_event::se::Serialize for StakeDeregistration {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for StakeDeregistration {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(1u64)?;
        self.stake_credential.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for StakeDeregistration {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("StakeDeregistration"))
    }
}

impl DeserializeEmbeddedGroup for StakeDeregistration {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 1 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(1),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let stake_credential =
            (|| -> Result<_, DeserializeError> { Ok(StakeCredential::deserialize(raw)?) })()
                .map_err(|e| e.annotate("stake_credential"))?;
        Ok(StakeDeregistration { stake_credential })
    }
}

impl cbor_event::se::Serialize for StakeDelegation {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for StakeDelegation {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(2u64)?;
        self.stake_credential.serialize(serializer)?;
        self.pool_keyhash.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for StakeDelegation {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("StakeDelegation"))
    }
}

impl DeserializeEmbeddedGroup for StakeDelegation {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 2 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(2),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let stake_credential =
            (|| -> Result<_, DeserializeError> { Ok(StakeCredential::deserialize(raw)?) })()
                .map_err(|e| e.annotate("stake_credential"))?;
        let pool_keyhash =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519KeyHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("pool_keyhash"))?;
        Ok(StakeDelegation {
            stake_credential,
            pool_keyhash,
        })
    }
}

impl cbor_event::se::Serialize for Ed25519KeyHashes {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for Ed25519KeyHashes {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(Ed25519KeyHash::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("Ed25519KeyHashes"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for Relays {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for Relays {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(Relay::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("Relays"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for PoolParams {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(9))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for PoolParams {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        self.operator.serialize(serializer)?;
        self.vrf_keyhash.serialize(serializer)?;
        self.pledge.serialize(serializer)?;
        self.cost.serialize(serializer)?;
        self.margin.serialize(serializer)?;
        self.reward_account.serialize(serializer)?;
        self.pool_owners.serialize(serializer)?;
        self.relays.serialize(serializer)?;
        match &self.pool_metadata {
            Some(x) => x.serialize(serializer),
            None => serializer.write_special(CBORSpecial::Null),
        }?;
        Ok(serializer)
    }
}

impl Deserialize for PoolParams {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("PoolParams"))
    }
}

impl DeserializeEmbeddedGroup for PoolParams {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let operator =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519KeyHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("operator"))?;
        let vrf_keyhash =
            (|| -> Result<_, DeserializeError> { Ok(VRFKeyHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("vrf_keyhash"))?;
        let pledge = (|| -> Result<_, DeserializeError> { Ok(Coin::deserialize(raw)?) })()
            .map_err(|e| e.annotate("pledge"))?;
        let cost = (|| -> Result<_, DeserializeError> { Ok(Coin::deserialize(raw)?) })()
            .map_err(|e| e.annotate("cost"))?;
        let margin = (|| -> Result<_, DeserializeError> { Ok(UnitInterval::deserialize(raw)?) })()
            .map_err(|e| e.annotate("margin"))?;
        let reward_account =
            (|| -> Result<_, DeserializeError> { Ok(RewardAddress::deserialize(raw)?) })()
                .map_err(|e| e.annotate("reward_account"))?;
        let pool_owners =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519KeyHashes::deserialize(raw)?) })()
                .map_err(|e| e.annotate("pool_owners"))?;
        let relays = (|| -> Result<_, DeserializeError> { Ok(Relays::deserialize(raw)?) })()
            .map_err(|e| e.annotate("relays"))?;
        let pool_metadata = (|| -> Result<_, DeserializeError> {
            Ok(match raw.cbor_type()? != CBORType::Special {
                true => Some(PoolMetadata::deserialize(raw)?),
                false => {
                    if raw.special()? != CBORSpecial::Null {
                        return Err(DeserializeFailure::ExpectedNull.into());
                    }
                    None
                }
            })
        })()
        .map_err(|e| e.annotate("pool_metadata"))?;
        Ok(PoolParams {
            operator,
            vrf_keyhash,
            pledge,
            cost,
            margin,
            reward_account,
            pool_owners,
            relays,
            pool_metadata,
        })
    }
}

impl cbor_event::se::Serialize for PoolRegistration {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(10))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for PoolRegistration {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(3u64)?;
        self.pool_params.serialize_as_embedded_group(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for PoolRegistration {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("PoolRegistration"))
    }
}

impl DeserializeEmbeddedGroup for PoolRegistration {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        len: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 3 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(3),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let pool_params = (|| -> Result<_, DeserializeError> {
            Ok(PoolParams::deserialize_as_embedded_group(raw, len)?)
        })()
        .map_err(|e| e.annotate("pool_params"))?;
        Ok(PoolRegistration {
            pool_params,
            is_update: None,
        })
    }
}

impl cbor_event::se::Serialize for PoolRetirement {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for PoolRetirement {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(4u64)?;
        self.pool_keyhash.serialize(serializer)?;
        self.epoch.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for PoolRetirement {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("PoolRetirement"))
    }
}

impl DeserializeEmbeddedGroup for PoolRetirement {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 4 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(4),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let pool_keyhash =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519KeyHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("pool_keyhash"))?;
        let epoch = (|| -> Result<_, DeserializeError> { Ok(Epoch::deserialize(raw)?) })()
            .map_err(|e| e.annotate("epoch"))?;
        Ok(PoolRetirement {
            pool_keyhash,
            epoch,
        })
    }
}

impl cbor_event::se::Serialize for GenesisKeyDelegation {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for GenesisKeyDelegation {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(5u64)?;
        self.genesishash.serialize(serializer)?;
        self.genesis_delegate_hash.serialize(serializer)?;
        self.vrf_keyhash.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for GenesisKeyDelegation {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("GenesisKeyDelegation"))
    }
}

impl DeserializeEmbeddedGroup for GenesisKeyDelegation {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 5 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(5),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let genesishash =
            (|| -> Result<_, DeserializeError> { Ok(GenesisHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("genesishash"))?;
        let genesis_delegate_hash =
            (|| -> Result<_, DeserializeError> { Ok(GenesisDelegateHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("genesis_delegate_hash"))?;
        let vrf_keyhash =
            (|| -> Result<_, DeserializeError> { Ok(VRFKeyHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("vrf_keyhash"))?;
        Ok(GenesisKeyDelegation {
            genesishash,
            genesis_delegate_hash,
            vrf_keyhash,
        })
    }
}

impl cbor_event::se::Serialize for MoveInstantaneousRewardsCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for MoveInstantaneousRewardsCert {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(6u64)?;
        self.move_instantaneous_reward.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for MoveInstantaneousRewardsCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("MoveInstantaneousRewardsCert"))
    }
}

impl DeserializeEmbeddedGroup for MoveInstantaneousRewardsCert {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 6 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(6),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let move_instantaneous_reward =
            (|| -> Result<_, DeserializeError> { Ok(MoveInstantaneousReward::deserialize(raw)?) })(
            )
            .map_err(|e| e.annotate("move_instantaneous_reward"))?;
        Ok(MoveInstantaneousRewardsCert {
            move_instantaneous_reward,
        })
    }
}

impl cbor_event::se::Serialize for CertificateEnum {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        match self {
            CertificateEnum::StakeRegistration(x) => x.serialize(serializer),
            CertificateEnum::StakeDeregistration(x) => x.serialize(serializer),
            CertificateEnum::StakeDelegation(x) => x.serialize(serializer),
            CertificateEnum::PoolRegistration(x) => x.serialize(serializer),
            CertificateEnum::PoolRetirement(x) => x.serialize(serializer),
            CertificateEnum::GenesisKeyDelegation(x) => x.serialize(serializer),
            CertificateEnum::MoveInstantaneousRewardsCert(x) => x.serialize(serializer),
            // Conway
            CertificateEnum::RegCert(x) => x.serialize(serializer),
            CertificateEnum::UnregCert(x) => x.serialize(serializer),
            CertificateEnum::VoteDelegCert(x) => x.serialize(serializer),
            CertificateEnum::StakeVoteDelegCert(x) => x.serialize(serializer),
            CertificateEnum::StakeRegDelegCert(x) => x.serialize(serializer),
            CertificateEnum::VoteRegDelegCert(x) => x.serialize(serializer),
            CertificateEnum::StakeVoteRegDelegCert(x) => x.serialize(serializer),
            CertificateEnum::RegCommitteeHotKeyCert(x) => x.serialize(serializer),
            CertificateEnum::UnregCommitteeHotKeyCert(x) => x.serialize(serializer),
            CertificateEnum::RegDrepCert(x) => x.serialize(serializer),
            CertificateEnum::UnregDrepCert(x) => x.serialize(serializer),
        }
    }
}

impl Deserialize for CertificateEnum {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("CertificateEnum"))
    }
}

impl DeserializeEmbeddedGroup for CertificateEnum {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        len: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let initial_position = raw.as_mut_ref().seek(SeekFrom::Current(0)).unwrap();
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(StakeRegistration::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::StakeRegistration(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(StakeDeregistration::deserialize_as_embedded_group(
                raw, len,
            )?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::StakeDeregistration(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(StakeDelegation::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::StakeDelegation(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(PoolRegistration::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::PoolRegistration(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(PoolRetirement::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::PoolRetirement(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(GenesisKeyDelegation::deserialize_as_embedded_group(
                raw, len,
            )?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::GenesisKeyDelegation(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(MoveInstantaneousRewardsCert::deserialize_as_embedded_group(
                raw, len,
            )?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::MoveInstantaneousRewardsCert(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(RegCert::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::RegCert(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(UnregCert::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::UnregCert(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(VoteDelegCert::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::VoteDelegCert(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(StakeVoteDelegCert::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::StakeVoteDelegCert(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(StakeRegDelegCert::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::StakeRegDelegCert(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(VoteRegDelegCert::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::VoteRegDelegCert(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(StakeVoteRegDelegCert::deserialize_as_embedded_group(
                raw, len,
            )?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::StakeVoteRegDelegCert(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(RegCommitteeHotKeyCert::deserialize_as_embedded_group(
                raw, len,
            )?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::RegCommitteeHotKeyCert(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(UnregCommitteeHotKeyCert::deserialize_as_embedded_group(
                raw, len,
            )?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::UnregCommitteeHotKeyCert(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(RegDrepCert::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::RegDrepCert(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(UnregDrepCert::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(CertificateEnum::UnregDrepCert(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        Err(DeserializeError::new(
            "CertificateEnum",
            DeserializeFailure::NoVariantMatched.into(),
        ))
    }
}

impl cbor_event::se::Serialize for Certificate {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        self.0.serialize(serializer)
    }
}

impl Deserialize for Certificate {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Ok(Self(CertificateEnum::deserialize(raw)?))
    }
}

impl cbor_event::se::Serialize for StakeCredentials {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for StakeCredentials {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(StakeCredential::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("StakeCredentials"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for MIRToStakeCredentials {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(self.rewards.len() as u64))?;
        for (key, value) in &self.rewards {
            key.serialize(serializer)?;
            value.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for MIRToStakeCredentials {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let mut table = linked_hash_map::LinkedHashMap::new();
            let len = raw.map()?;
            while match len {
                cbor_event::Len::Len(n) => table.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                let key = StakeCredential::deserialize(raw)?;
                let value = DeltaCoin::deserialize(raw)?;
                if table.insert(key.clone(), value).is_some() {
                    return Err(DeserializeFailure::DuplicateKey(Key::Str(format!(
                        "StakeCred: {} (hex bytes)",
                        hex::encode(key.to_bytes())
                    )))
                    .into());
                }
            }
            Ok(Self { rewards: table })
        })()
        .map_err(|e| e.annotate("MIRToStakeCredentials"))
    }
}

impl cbor_event::se::Serialize for MoveInstantaneousReward {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        match self.pot {
            MIRPot::Reserves => serializer.write_unsigned_integer(0u64),
            MIRPot::Treasury => serializer.write_unsigned_integer(1u64),
        }?;
        match &self.variant {
            MIREnum::ToOtherPot(amount) => amount.serialize(serializer),
            MIREnum::ToStakeCredentials(amounts) => amounts.serialize(serializer),
        }
    }
}

impl Deserialize for MoveInstantaneousReward {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let outer_len = raw.array()?;
            let pot = match raw.unsigned_integer()? {
                0 => MIRPot::Reserves,
                1 => MIRPot::Treasury,
                n => return Err(DeserializeFailure::UnknownKey(Key::Uint(n)).into()),
            };
            let variant = match raw.cbor_type()? {
                CBORType::UnsignedInteger => MIREnum::ToOtherPot(Coin::deserialize(raw)?),
                CBORType::Map => {
                    MIREnum::ToStakeCredentials(MIRToStakeCredentials::deserialize(raw)?)
                }
                _ => return Err(DeserializeFailure::NoVariantMatched.into()),
            };
            match outer_len {
                cbor_event::Len::Len(n) => {
                    if n != 2 {
                        return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                            n,
                            outer_len,
                            "MoveInstantaneousReward",
                        ))
                        .into());
                    }
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            };
            Ok(Self { pot, variant })
        })()
        .map_err(|e| e.annotate("MoveInstantaneousReward"))
    }
}

impl cbor_event::se::Serialize for Ipv4 {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_bytes(&self.0)
    }
}

impl Deserialize for Ipv4 {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Self::new_impl(raw.bytes()?)
    }
}

impl cbor_event::se::Serialize for Ipv6 {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_bytes(&self.0)
    }
}

impl Deserialize for Ipv6 {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Self::new_impl(raw.bytes()?)
    }
}

impl cbor_event::se::Serialize for DNSRecordAorAAAA {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_text(&self.0)
    }
}

impl Deserialize for DNSRecordAorAAAA {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Self::new_impl(raw.text()?)
    }
}

impl cbor_event::se::Serialize for DNSRecordSRV {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_text(&self.0)
    }
}

impl Deserialize for DNSRecordSRV {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Self::new_impl(raw.text()?)
    }
}

impl cbor_event::se::Serialize for Url {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_text(&self.0)
    }
}

impl Deserialize for Url {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Self::new_impl(raw.text()?)
    }
}

impl cbor_event::se::Serialize for SingleHostAddr {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for SingleHostAddr {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(0u64)?;
        match &self.port {
            Some(x) => x.serialize(serializer),
            None => serializer.write_special(CBORSpecial::Null),
        }?;
        match &self.ipv4 {
            Some(x) => x.serialize(serializer),
            None => serializer.write_special(CBORSpecial::Null),
        }?;
        match &self.ipv6 {
            Some(x) => x.serialize(serializer),
            None => serializer.write_special(CBORSpecial::Null),
        }?;
        Ok(serializer)
    }
}

impl Deserialize for SingleHostAddr {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("SingleHostAddr"))
    }
}

impl DeserializeEmbeddedGroup for SingleHostAddr {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 0 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(0),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let port = (|| -> Result<_, DeserializeError> {
            Ok(match raw.cbor_type()? != CBORType::Special {
                true => Some(Port::deserialize(raw)?),
                false => {
                    if raw.special()? != CBORSpecial::Null {
                        return Err(DeserializeFailure::ExpectedNull.into());
                    }
                    None
                }
            })
        })()
        .map_err(|e| e.annotate("port"))?;
        let ipv4 = (|| -> Result<_, DeserializeError> {
            Ok(match raw.cbor_type()? != CBORType::Special {
                true => Some(Ipv4::deserialize(raw)?),
                false => {
                    if raw.special()? != CBORSpecial::Null {
                        return Err(DeserializeFailure::ExpectedNull.into());
                    }
                    None
                }
            })
        })()
        .map_err(|e| e.annotate("ipv4"))?;
        let ipv6 = (|| -> Result<_, DeserializeError> {
            Ok(match raw.cbor_type()? != CBORType::Special {
                true => Some(Ipv6::deserialize(raw)?),
                false => {
                    if raw.special()? != CBORSpecial::Null {
                        return Err(DeserializeFailure::ExpectedNull.into());
                    }
                    None
                }
            })
        })()
        .map_err(|e| e.annotate("ipv6"))?;
        Ok(SingleHostAddr { port, ipv4, ipv6 })
    }
}

impl cbor_event::se::Serialize for SingleHostName {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for SingleHostName {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(1u64)?;
        match &self.port {
            Some(x) => x.serialize(serializer),
            None => serializer.write_special(CBORSpecial::Null),
        }?;
        self.dns_name.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for SingleHostName {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("SingleHostName"))
    }
}

impl DeserializeEmbeddedGroup for SingleHostName {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 1 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(1),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let port = (|| -> Result<_, DeserializeError> {
            Ok(match raw.cbor_type()? != CBORType::Special {
                true => Some(Port::deserialize(raw)?),
                false => {
                    if raw.special()? != CBORSpecial::Null {
                        return Err(DeserializeFailure::ExpectedNull.into());
                    }
                    None
                }
            })
        })()
        .map_err(|e| e.annotate("port"))?;
        let dns_name =
            (|| -> Result<_, DeserializeError> { Ok(DNSRecordAorAAAA::deserialize(raw)?) })()
                .map_err(|e| e.annotate("dns_name"))?;
        Ok(SingleHostName { port, dns_name })
    }
}

impl cbor_event::se::Serialize for MultiHostName {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for MultiHostName {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(2u64)?;
        self.dns_name.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for MultiHostName {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("MultiHostName"))
    }
}

impl DeserializeEmbeddedGroup for MultiHostName {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 2 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(2),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let dns_name =
            (|| -> Result<_, DeserializeError> { Ok(DNSRecordSRV::deserialize(raw)?) })()
                .map_err(|e| e.annotate("dns_name"))?;
        Ok(MultiHostName { dns_name })
    }
}

impl cbor_event::se::Serialize for RelayEnum {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        match self {
            RelayEnum::SingleHostAddr(x) => x.serialize(serializer),
            RelayEnum::SingleHostName(x) => x.serialize(serializer),
            RelayEnum::MultiHostName(x) => x.serialize(serializer),
        }
    }
}

impl Deserialize for RelayEnum {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("RelayEnum"))
    }
}

impl DeserializeEmbeddedGroup for RelayEnum {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        len: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let initial_position = raw.as_mut_ref().seek(SeekFrom::Current(0)).unwrap();
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(SingleHostAddr::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(RelayEnum::SingleHostAddr(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(SingleHostName::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(RelayEnum::SingleHostName(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
            Ok(MultiHostName::deserialize_as_embedded_group(raw, len)?)
        })(raw)
        {
            Ok(variant) => return Ok(RelayEnum::MultiHostName(variant)),
            Err(_) => raw
                .as_mut_ref()
                .seek(SeekFrom::Start(initial_position))
                .unwrap(),
        };
        Err(DeserializeError::new(
            "RelayEnum",
            DeserializeFailure::NoVariantMatched.into(),
        ))
    }
}

impl cbor_event::se::Serialize for Relay {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        self.0.serialize(serializer)
    }
}

impl Deserialize for Relay {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Ok(Self(RelayEnum::deserialize(raw)?))
    }
}

impl cbor_event::se::Serialize for PoolMetadata {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.url.serialize(serializer)?;
        self.pool_metadata_hash.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for PoolMetadata {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("PoolMetadata"))
    }
}

impl DeserializeEmbeddedGroup for PoolMetadata {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let url = (|| -> Result<_, DeserializeError> { Ok(Url::deserialize(raw)?) })()
            .map_err(|e| e.annotate("url"))?;
        let pool_metadata_hash =
            (|| -> Result<_, DeserializeError> { Ok(PoolMetadataHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("pool_metadata_hash"))?;
        Ok(PoolMetadata {
            url,
            pool_metadata_hash,
        })
    }
}

impl cbor_event::se::Serialize for RewardAddresses {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for RewardAddresses {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(RewardAddress::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("RewardAddresses"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for Withdrawals {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(self.0.len() as u64))?;
        for (key, value) in &self.0 {
            key.serialize(serializer)?;
            value.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for Withdrawals {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut table = std::collections::BTreeMap::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            while match len {
                cbor_event::Len::Len(n) => table.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                let key = RewardAddress::deserialize(raw)?;
                let value = Coin::deserialize(raw)?;
                if table.insert(key.clone(), value).is_some() {
                    return Err(DeserializeFailure::DuplicateKey(Key::Str(String::from(
                        "some complicated/unsupported type",
                    )))
                    .into());
                }
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("Withdrawals"))?;
        Ok(Self(table))
    }
}

impl cbor_event::se::Serialize for TransactionWitnessSet {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(
            match &self.vkeys {
                Some(_) => 1,
                None => 0,
            } + match &self.native_scripts {
                Some(_) => 1,
                None => 0,
            } + match &self.bootstraps {
                Some(_) => 1,
                None => 0,
            } + match &self.plutus_scripts {
                Some(_) => 1,
                None => 0,
            } + match &self.plutus_data {
                Some(_) => 1,
                None => 0,
            } + match &self.redeemers {
                Some(_) => 1,
                None => 0,
            } + match &self.plutus_v2_scripts {
                Some(_) => 1,
                None => 0,
            } + match &self.plutus_v3_scripts {
                Some(_) => 1,
                None => 0,
            },
        ))?;
        if let Some(field) = &self.vkeys {
            serializer.write_unsigned_integer(0)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.native_scripts {
            serializer.write_unsigned_integer(1)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.bootstraps {
            serializer.write_unsigned_integer(2)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.plutus_scripts {
            serializer.write_unsigned_integer(3)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.plutus_data {
            serializer.write_unsigned_integer(4)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.redeemers {
            serializer.write_unsigned_integer(5)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.plutus_v2_scripts {
            serializer.write_unsigned_integer(6)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.plutus_v3_scripts {
            serializer.write_unsigned_integer(7)?;
            field.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for TransactionWitnessSet {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            let mut read_len = CBORReadLen::new(len);
            let mut vkeys = None;
            let mut native_scripts = None;
            let mut bootstraps = None;
            let mut plutus_scripts = None;
            let mut plutus_data = None;
            let mut redeemers = None;
            let mut plutus_v2_scripts = None;
            let mut plutus_v3_scripts = None;
            let mut read = 0;
            while match len {
                cbor_event::Len::Len(n) => read < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                match raw.cbor_type()? {
                    CBORType::UnsignedInteger => match raw.unsigned_integer()? {
                        0 => {
                            if vkeys.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(0)).into());
                            }
                            vkeys = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Vkeywitnesses::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("vkeys"))?,
                            );
                        }
                        1 => {
                            if native_scripts.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(1)).into());
                            }
                            native_scripts = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(NativeScripts::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("native_scripts"))?,
                            );
                        }
                        2 => {
                            if bootstraps.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(2)).into());
                            }
                            bootstraps = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(BootstrapWitnesses::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("bootstraps"))?,
                            );
                        }
                        3 => {
                            if plutus_scripts.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(3)).into());
                            }
                            plutus_scripts = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(PlutusScripts::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("plutus_scripts"))?,
                            );
                        }
                        4 => {
                            if plutus_data.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(4)).into());
                            }
                            plutus_data = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(PlutusList::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("plutus_data"))?,
                            );
                        }
                        5 => {
                            if redeemers.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(5)).into());
                            }
                            redeemers = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Redeemers::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("redeemers"))?,
                            );
                        }
                        6 => {
                            if plutus_v2_scripts.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(3)).into());
                            }
                            plutus_v2_scripts = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(PlutusScripts::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("plutus_v2_scripts"))?,
                            );
                        }
                        7 => {
                            if plutus_v3_scripts.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(3)).into());
                            }
                            plutus_v3_scripts = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(PlutusScripts::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("plutus_v3_scripts"))?,
                            );
                        }
                        unknown_key => {
                            return Err(
                                DeserializeFailure::UnknownKey(Key::Uint(unknown_key)).into()
                            )
                        }
                    },
                    CBORType::Text => match raw.text()?.as_str() {
                        unknown_key => {
                            return Err(DeserializeFailure::UnknownKey(Key::Str(
                                unknown_key.to_owned(),
                            ))
                            .into())
                        }
                    },
                    CBORType::Special => match len {
                        cbor_event::Len::Len(_) => {
                            return Err(DeserializeFailure::BreakInDefiniteLen.into())
                        }
                        cbor_event::Len::Indefinite => match raw.special()? {
                            CBORSpecial::Break => break,
                            _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                        },
                    },
                    other_type => {
                        return Err(DeserializeFailure::UnexpectedKeyType(other_type).into())
                    }
                }
                read += 1;
            }
            read_len.finish()?;
            Ok(Self {
                vkeys,
                native_scripts,
                bootstraps,
                plutus_scripts,
                plutus_data,
                redeemers,
                plutus_v2_scripts,
                plutus_v3_scripts,
            })
        })()
        .map_err(|e| e.annotate("TransactionWitnessSet"))
    }
}

impl cbor_event::se::Serialize for ScriptPubkey {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for ScriptPubkey {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(0u64)?;
        self.addr_keyhash.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for ScriptPubkey {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(2)?;
            let ret = Self::deserialize_as_embedded_group(raw, /*mut read_len, */ len);
            match len {
                cbor_event::Len::Len(_) => read_len.finish()?,
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("ScriptPubkey"))
    }
}

impl DeserializeEmbeddedGroup for ScriptPubkey {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        /*read_len: &mut CBORReadLen, */ _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 0 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(0),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let addr_keyhash =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519KeyHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("addr_keyhash"))?;
        Ok(ScriptPubkey { addr_keyhash })
    }
}

impl cbor_event::se::Serialize for ScriptAll {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for ScriptAll {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(1u64)?;
        self.native_scripts.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for ScriptAll {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(2)?;
            let ret = Self::deserialize_as_embedded_group(raw, /*mut read_len, */ len);
            match len {
                cbor_event::Len::Len(_) => read_len.finish()?,
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("ScriptAll"))
    }
}

impl DeserializeEmbeddedGroup for ScriptAll {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        /*read_len: &mut CBORReadLen, */ _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 1 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(1),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let native_scripts =
            (|| -> Result<_, DeserializeError> { Ok(NativeScripts::deserialize(raw)?) })()
                .map_err(|e| e.annotate("native_scripts"))?;
        Ok(ScriptAll { native_scripts })
    }
}

impl cbor_event::se::Serialize for ScriptAny {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for ScriptAny {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(2u64)?;
        self.native_scripts.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for ScriptAny {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(2)?;
            let ret = Self::deserialize_as_embedded_group(raw, /*mut read_len, */ len);
            match len {
                cbor_event::Len::Len(_) => read_len.finish()?,
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("ScriptAny"))
    }
}

impl DeserializeEmbeddedGroup for ScriptAny {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        /*/*read_len: &mut CBORReadLen, */*/ _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 2 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(2),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let native_scripts =
            (|| -> Result<_, DeserializeError> { Ok(NativeScripts::deserialize(raw)?) })()
                .map_err(|e| e.annotate("native_scripts"))?;
        Ok(ScriptAny { native_scripts })
    }
}

impl cbor_event::se::Serialize for ScriptNOfK {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(3))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for ScriptNOfK {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(3u64)?;
        self.n.serialize(serializer)?;
        self.native_scripts.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for ScriptNOfK {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(3)?;
            let ret = Self::deserialize_as_embedded_group(raw, /*mut read_len, */ len);
            match len {
                cbor_event::Len::Len(_) => read_len.finish()?,
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("ScriptNOfK"))
    }
}

impl DeserializeEmbeddedGroup for ScriptNOfK {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        /*read_len: &mut CBORReadLen, */ _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 3 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(3),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let n = (|| -> Result<_, DeserializeError> { Ok(u32::deserialize(raw)?) })()
            .map_err(|e| e.annotate("n"))?;
        let native_scripts =
            (|| -> Result<_, DeserializeError> { Ok(NativeScripts::deserialize(raw)?) })()
                .map_err(|e| e.annotate("native_scripts"))?;
        Ok(ScriptNOfK { n, native_scripts })
    }
}

impl cbor_event::se::Serialize for TimelockStart {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for TimelockStart {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(4u64)?;
        self.slot.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for TimelockStart {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(2)?;
            let ret = Self::deserialize_as_embedded_group(raw, /*mut read_len, */ len);
            match len {
                cbor_event::Len::Len(_) => read_len.finish()?,
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("TimelockStart"))
    }
}

impl DeserializeEmbeddedGroup for TimelockStart {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        /*read_len: &mut CBORReadLen, */ _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 4 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(4),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let slot = (|| -> Result<_, DeserializeError> { Ok(Slot::deserialize(raw)?) })()
            .map_err(|e| e.annotate("slot"))?;
        Ok(TimelockStart { slot })
    }
}

impl cbor_event::se::Serialize for TimelockExpiry {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for TimelockExpiry {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(5u64)?;
        self.slot.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for TimelockExpiry {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(2)?;
            let ret = Self::deserialize_as_embedded_group(raw, /*&mut read_len, */ len);
            match len {
                cbor_event::Len::Len(_) => read_len.finish()?,
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("TimelockExpiry"))
    }
}

impl DeserializeEmbeddedGroup for TimelockExpiry {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        /*read_len: &mut CBORReadLen, */ _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let index_0_value = raw.unsigned_integer()?;
            if index_0_value != 5 {
                return Err(DeserializeFailure::FixedValueMismatch {
                    found: Key::Uint(index_0_value),
                    expected: Key::Uint(5),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("index_0"))?;
        let slot = (|| -> Result<_, DeserializeError> { Ok(Slot::deserialize(raw)?) })()
            .map_err(|e| e.annotate("slot"))?;
        Ok(TimelockExpiry { slot })
    }
}

impl cbor_event::se::Serialize for NativeScriptEnum {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        match self {
            NativeScriptEnum::ScriptPubkey(x) => x.serialize(serializer),
            NativeScriptEnum::ScriptAll(x) => x.serialize(serializer),
            NativeScriptEnum::ScriptAny(x) => x.serialize(serializer),
            NativeScriptEnum::ScriptNOfK(x) => x.serialize(serializer),
            NativeScriptEnum::TimelockStart(x) => x.serialize(serializer),
            NativeScriptEnum::TimelockExpiry(x) => x.serialize(serializer),
        }
    }
}

impl Deserialize for NativeScriptEnum {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            //let mut read_len = CBORReadLen::new(len);
            let initial_position = raw.as_mut_ref().seek(SeekFrom::Current(0)).unwrap();
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(ScriptPubkey::deserialize_as_embedded_group(
                    raw, /*&mut read_len, */ len,
                )?)
            })(raw)
            {
                Ok(variant) => return Ok(NativeScriptEnum::ScriptPubkey(variant)),
                Err(_) => raw
                    .as_mut_ref()
                    .seek(SeekFrom::Start(initial_position))
                    .unwrap(),
            };
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(ScriptAll::deserialize_as_embedded_group(
                    raw, /*mut read_len, */ len,
                )?)
            })(raw)
            {
                Ok(variant) => return Ok(NativeScriptEnum::ScriptAll(variant)),
                Err(_) => raw
                    .as_mut_ref()
                    .seek(SeekFrom::Start(initial_position))
                    .unwrap(),
            };
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(ScriptAny::deserialize_as_embedded_group(
                    raw, /*mut read_len, */ len,
                )?)
            })(raw)
            {
                Ok(variant) => return Ok(NativeScriptEnum::ScriptAny(variant)),
                Err(_) => raw
                    .as_mut_ref()
                    .seek(SeekFrom::Start(initial_position))
                    .unwrap(),
            };
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(ScriptNOfK::deserialize_as_embedded_group(
                    raw, /*mut read_len, */ len,
                )?)
            })(raw)
            {
                Ok(variant) => return Ok(NativeScriptEnum::ScriptNOfK(variant)),
                Err(_) => raw
                    .as_mut_ref()
                    .seek(SeekFrom::Start(initial_position))
                    .unwrap(),
            };
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(TimelockStart::deserialize_as_embedded_group(
                    raw, /*mut read_len, */ len,
                )?)
            })(raw)
            {
                Ok(variant) => return Ok(NativeScriptEnum::TimelockStart(variant)),
                Err(_) => raw
                    .as_mut_ref()
                    .seek(SeekFrom::Start(initial_position))
                    .unwrap(),
            };
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(TimelockExpiry::deserialize_as_embedded_group(
                    raw, /*mut read_len, */ len,
                )?)
            })(raw)
            {
                Ok(variant) => return Ok(NativeScriptEnum::TimelockExpiry(variant)),
                Err(_) => raw
                    .as_mut_ref()
                    .seek(SeekFrom::Start(initial_position))
                    .unwrap(),
            };
            match len {
                cbor_event::Len::Len(_) => (), /*read_len.finish()?*/
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break => (), /*read_len.finish()?*/
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            Err(DeserializeError::new(
                "NativeScriptEnum",
                DeserializeFailure::NoVariantMatched.into(),
            ))
        })()
        .map_err(|e| e.annotate("NativeScriptEnum"))
    }
}

impl cbor_event::se::Serialize for NativeScript {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        self.0.serialize(serializer)
    }
}

impl Deserialize for NativeScript {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Ok(Self(NativeScriptEnum::deserialize(raw)?))
    }
}

impl cbor_event::se::Serialize for NativeScripts {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for NativeScripts {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(NativeScript::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("NativeScripts"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for Update {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.proposed_protocol_parameter_updates
            .serialize(serializer)?;
        self.epoch.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for Update {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("Update"))
    }
}

impl DeserializeEmbeddedGroup for Update {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let proposed_protocol_parameter_updates = (|| -> Result<_, DeserializeError> {
            Ok(ProposedProtocolParameterUpdates::deserialize(raw)?)
        })()
        .map_err(|e| e.annotate("proposed_protocol_parameter_updates"))?;
        let epoch = (|| -> Result<_, DeserializeError> { Ok(Epoch::deserialize(raw)?) })()
            .map_err(|e| e.annotate("epoch"))?;
        Ok(Update {
            proposed_protocol_parameter_updates,
            epoch,
        })
    }
}

impl cbor_event::se::Serialize for GenesisHashes {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for GenesisHashes {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(GenesisHash::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("Genesishashes"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for ScriptHashes {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for ScriptHashes {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(ScriptHash::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("ScriptHashes"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for ProposedProtocolParameterUpdates {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(self.0.len() as u64))?;
        for (key, value) in &self.0 {
            key.serialize(serializer)?;
            value.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for ProposedProtocolParameterUpdates {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut table = linked_hash_map::LinkedHashMap::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            while match len {
                cbor_event::Len::Len(n) => table.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                let key = GenesisHash::deserialize(raw)?;
                let value = ProtocolParamUpdate::deserialize(raw)?;
                if table.insert(key.clone(), value).is_some() {
                    return Err(DeserializeFailure::DuplicateKey(Key::Str(String::from(
                        "some complicated/unsupported type",
                    )))
                    .into());
                }
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("ProposedProtocolParameterUpdates"))?;
        Ok(Self(table))
    }
}

impl cbor_event::se::Serialize for ProtocolVersion {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for ProtocolVersion {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        self.major.serialize(serializer)?;
        self.minor.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for ProtocolVersion {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("ProtocolVersion"))
    }
}

impl DeserializeEmbeddedGroup for ProtocolVersion {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let major = (|| -> Result<_, DeserializeError> { Ok(u32::deserialize(raw)?) })()
            .map_err(|e| e.annotate("major"))?;
        let minor = (|| -> Result<_, DeserializeError> { Ok(u32::deserialize(raw)?) })()
            .map_err(|e| e.annotate("minor"))?;
        Ok(ProtocolVersion { major, minor })
    }
}

impl cbor_event::se::Serialize for ProtocolParamUpdate {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(
            match &self.minfee_a {
                Some(_) => 1,
                None => 0,
            } + match &self.minfee_b {
                Some(_) => 1,
                None => 0,
            } + match &self.max_block_body_size {
                Some(_) => 1,
                None => 0,
            } + match &self.max_tx_size {
                Some(_) => 1,
                None => 0,
            } + match &self.max_block_header_size {
                Some(_) => 1,
                None => 0,
            } + match &self.key_deposit {
                Some(_) => 1,
                None => 0,
            } + match &self.pool_deposit {
                Some(_) => 1,
                None => 0,
            } + match &self.max_epoch {
                Some(_) => 1,
                None => 0,
            } + match &self.n_opt {
                Some(_) => 1,
                None => 0,
            } + match &self.pool_pledge_influence {
                Some(_) => 1,
                None => 0,
            } + match &self.expansion_rate {
                Some(_) => 1,
                None => 0,
            } + match &self.treasury_growth_rate {
                Some(_) => 1,
                None => 0,
            } + match &self.d {
                Some(_) => 1,
                None => 0,
            } + match &self.extra_entropy {
                Some(_) => 1,
                None => 0,
            } + match &self.protocol_version {
                Some(_) => 1,
                None => 0,
            } + match &self.min_pool_cost {
                Some(_) => 1,
                None => 0,
            } + match &self.ada_per_utxo_byte {
                Some(_) => 1,
                None => 0,
            } + match &self.cost_models {
                Some(_) => 1,
                None => 0,
            } + match &self.execution_costs {
                Some(_) => 1,
                None => 0,
            } + match &self.max_tx_ex_units {
                Some(_) => 1,
                None => 0,
            } + match &self.max_block_ex_units {
                Some(_) => 1,
                None => 0,
            } + match &self.max_value_size {
                Some(_) => 1,
                None => 0,
            } + match &self.pool_voting_thresholds {
                Some(_) => 1,
                None => 0,
            } + match &self.drep_voting_thresholds {
                Some(_) => 1,
                None => 0,
            } + match &self.min_committee_size {
                Some(_) => 1,
                None => 0,
            } + match &self.committee_term_limit {
                Some(_) => 1,
                None => 0,
            } + match &self.governance_action_expiration {
                Some(_) => 1,
                None => 0,
            } + match &self.governance_action_deposit {
                Some(_) => 1,
                None => 0,
            } + match &self.drep_deposit {
                Some(_) => 1,
                None => 0,
            } + match &self.drep_inactivity_period {
                Some(_) => 1,
                None => 0,
            },
        ))?;
        if let Some(field) = &self.minfee_a {
            serializer.write_unsigned_integer(0)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.minfee_b {
            serializer.write_unsigned_integer(1)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.max_block_body_size {
            serializer.write_unsigned_integer(2)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.max_tx_size {
            serializer.write_unsigned_integer(3)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.max_block_header_size {
            serializer.write_unsigned_integer(4)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.key_deposit {
            serializer.write_unsigned_integer(5)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.pool_deposit {
            serializer.write_unsigned_integer(6)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.max_epoch {
            serializer.write_unsigned_integer(7)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.n_opt {
            serializer.write_unsigned_integer(8)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.pool_pledge_influence {
            serializer.write_unsigned_integer(9)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.expansion_rate {
            serializer.write_unsigned_integer(10)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.treasury_growth_rate {
            serializer.write_unsigned_integer(11)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.d {
            serializer.write_unsigned_integer(12)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.extra_entropy {
            serializer.write_unsigned_integer(13)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.protocol_version {
            serializer.write_unsigned_integer(14)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.min_pool_cost {
            serializer.write_unsigned_integer(16)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.ada_per_utxo_byte {
            serializer.write_unsigned_integer(17)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.cost_models {
            serializer.write_unsigned_integer(18)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.execution_costs {
            serializer.write_unsigned_integer(19)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.max_tx_ex_units {
            serializer.write_unsigned_integer(20)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.max_block_ex_units {
            serializer.write_unsigned_integer(21)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.max_value_size {
            serializer.write_unsigned_integer(22)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.collateral_percentage {
            serializer.write_unsigned_integer(23)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.max_collateral_inputs {
            serializer.write_unsigned_integer(24)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.pool_voting_thresholds {
            serializer.write_unsigned_integer(24)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.drep_voting_thresholds {
            serializer.write_unsigned_integer(24)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.min_committee_size {
            serializer.write_unsigned_integer(24)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.committee_term_limit {
            serializer.write_unsigned_integer(24)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.governance_action_expiration {
            serializer.write_unsigned_integer(24)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.governance_action_deposit {
            serializer.write_unsigned_integer(24)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.drep_deposit {
            serializer.write_unsigned_integer(24)?;
            field.serialize(serializer)?;
        }
        if let Some(field) = &self.drep_inactivity_period {
            serializer.write_unsigned_integer(24)?;
            field.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for ProtocolParamUpdate {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            let mut read_len = CBORReadLen::new(len);
            let mut minfee_a = None;
            let mut minfee_b = None;
            let mut max_block_body_size = None;
            let mut max_tx_size = None;
            let mut max_block_header_size = None;
            let mut key_deposit = None;
            let mut pool_deposit = None;
            let mut max_epoch = None;
            let mut n_opt = None;
            let mut pool_pledge_influence = None;
            let mut expansion_rate = None;
            let mut treasury_growth_rate = None;
            let mut d = None;
            let mut extra_entropy = None;
            let mut protocol_version = None;
            let mut min_pool_cost = None;
            let mut ada_per_utxo_byte = None;
            let mut cost_models = None;
            let mut execution_costs = None;
            let mut max_tx_ex_units = None;
            let mut max_block_ex_units = None;
            let mut max_value_size = None;
            let mut collateral_percentage = None;
            let mut max_collateral_inputs = None;
            let mut pool_voting_thresholds = None;
            let mut drep_voting_thresholds = None;
            let mut min_committee_size = None;
            let mut committee_term_limit = None;
            let mut governance_action_expiration = None;
            let mut governance_action_deposit = None;
            let mut drep_deposit = None;
            let mut drep_inactivity_period = None;

            let mut read = 0;
            while match len {
                cbor_event::Len::Len(n) => read < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                match raw.cbor_type()? {
                    CBORType::UnsignedInteger => match raw.unsigned_integer()? {
                        0 => {
                            if minfee_a.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(0)).into());
                            }
                            minfee_a = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Coin::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("minfee_a"))?,
                            );
                        }
                        1 => {
                            if minfee_b.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(1)).into());
                            }
                            minfee_b = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Coin::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("minfee_b"))?,
                            );
                        }
                        2 => {
                            if max_block_body_size.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(2)).into());
                            }
                            max_block_body_size = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(u32::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("max_block_body_size"))?,
                            );
                        }
                        3 => {
                            if max_tx_size.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(3)).into());
                            }
                            max_tx_size = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(u32::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("max_tx_size"))?,
                            );
                        }
                        4 => {
                            if max_block_header_size.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(4)).into());
                            }
                            max_block_header_size = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(u32::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("max_block_header_size"))?,
                            );
                        }
                        5 => {
                            if key_deposit.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(5)).into());
                            }
                            key_deposit = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Coin::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("key_deposit"))?,
                            );
                        }
                        6 => {
                            if pool_deposit.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(6)).into());
                            }
                            pool_deposit = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Coin::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("pool_deposit"))?,
                            );
                        }
                        7 => {
                            if max_epoch.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(7)).into());
                            }
                            max_epoch = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Epoch::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("max_epoch"))?,
                            );
                        }
                        8 => {
                            if n_opt.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(8)).into());
                            }
                            n_opt = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(u32::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("n_opt"))?,
                            );
                        }
                        9 => {
                            if pool_pledge_influence.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(9)).into());
                            }
                            pool_pledge_influence = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Rational::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("pool_pledge_influence"))?,
                            );
                        }
                        10 => {
                            if expansion_rate.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(10)).into());
                            }
                            expansion_rate = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(UnitInterval::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("expansion_rate"))?,
                            );
                        }
                        11 => {
                            if treasury_growth_rate.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(11)).into());
                            }
                            treasury_growth_rate = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(UnitInterval::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("treasury_growth_rate"))?,
                            );
                        }
                        12 => {
                            if d.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(12)).into());
                            }
                            d = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(UnitInterval::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("d"))?,
                            );
                        }
                        13 => {
                            if extra_entropy.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(13)).into());
                            }
                            extra_entropy = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Nonce::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("extra_entropy"))?,
                            );
                        }
                        14 => {
                            if protocol_version.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(14)).into());
                            }
                            protocol_version = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(ProtocolVersion::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("protocol_version"))?,
                            );
                        }
                        16 => {
                            if min_pool_cost.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(16)).into());
                            }
                            min_pool_cost = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Coin::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("min_pool_cost"))?,
                            );
                        }
                        17 => {
                            if ada_per_utxo_byte.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(17)).into());
                            }
                            ada_per_utxo_byte = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Coin::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("ada_per_utxo_byte"))?,
                            );
                        }
                        18 => {
                            if cost_models.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(18)).into());
                            }
                            cost_models = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Costmdls::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("cost_models"))?,
                            );
                        }
                        19 => {
                            if execution_costs.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(19)).into());
                            }
                            execution_costs = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(ExUnitPrices::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("execution_costs"))?,
                            );
                        }
                        20 => {
                            if max_tx_ex_units.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(20)).into());
                            }
                            max_tx_ex_units = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(ExUnits::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("max_tx_ex_units"))?,
                            );
                        }
                        21 => {
                            if max_block_ex_units.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(21)).into());
                            }
                            max_block_ex_units = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(ExUnits::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("max_block_ex_units"))?,
                            );
                        }
                        22 => {
                            if max_value_size.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(22)).into());
                            }
                            max_value_size = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(u32::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("max_value_size"))?,
                            );
                        }
                        23 => {
                            if collateral_percentage.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(23)).into());
                            }
                            collateral_percentage = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(u32::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("collateral_percentage"))?,
                            );
                        }
                        24 => {
                            if max_collateral_inputs.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(24)).into());
                            }
                            max_collateral_inputs = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(u32::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("max_collateral_inputs"))?,
                            );
                        }
                        25 => {
                            if pool_voting_thresholds.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(25)).into());
                            }
                            pool_voting_thresholds = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(PoolVotingThresholds::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("pool_voting_thresholds"))?,
                            );
                        }
                        26 => {
                            if drep_voting_thresholds.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(26)).into());
                            }
                            drep_voting_thresholds = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(DrepVotingThresholds::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("drep_voting_thresholds"))?,
                            );
                        }
                        27 => {
                            if min_committee_size.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(27)).into());
                            }
                            min_committee_size = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Coin::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("min_committee_size"))?,
                            );
                        }
                        28 => {
                            if committee_term_limit.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(28)).into());
                            }
                            committee_term_limit = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Coin::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("committee_term_limit"))?,
                            );
                        }
                        29 => {
                            if governance_action_expiration.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(29)).into());
                            }
                            governance_action_expiration = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Coin::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("governance_action_expiration"))?,
                            );
                        }
                        30 => {
                            if governance_action_deposit.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(30)).into());
                            }
                            governance_action_deposit = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Coin::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("governance_action_deposit"))?,
                            );
                        }
                        31 => {
                            if drep_deposit.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(31)).into());
                            }
                            drep_deposit = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Coin::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("drep_deposit"))?,
                            );
                        }
                        32 => {
                            if drep_inactivity_period.is_some() {
                                return Err(DeserializeFailure::DuplicateKey(Key::Uint(32)).into());
                            }
                            drep_inactivity_period = Some(
                                (|| -> Result<_, DeserializeError> {
                                    read_len.read_elems(1)?;
                                    Ok(Epoch::deserialize(raw)?)
                                })()
                                .map_err(|e| e.annotate("drep_inactivity_period"))?,
                            );
                        }
                        unknown_key => {
                            return Err(
                                DeserializeFailure::UnknownKey(Key::Uint(unknown_key)).into()
                            )
                        }
                    },
                    CBORType::Text => match raw.text()?.as_str() {
                        unknown_key => {
                            return Err(DeserializeFailure::UnknownKey(Key::Str(
                                unknown_key.to_owned(),
                            ))
                            .into())
                        }
                    },
                    CBORType::Special => match len {
                        cbor_event::Len::Len(_) => {
                            return Err(DeserializeFailure::BreakInDefiniteLen.into())
                        }
                        cbor_event::Len::Indefinite => match raw.special()? {
                            CBORSpecial::Break => break,
                            _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                        },
                    },
                    other_type => {
                        return Err(DeserializeFailure::UnexpectedKeyType(other_type).into())
                    }
                }
                read += 1;
            }
            read_len.finish()?;
            Ok(Self {
                minfee_a,
                minfee_b,
                max_block_body_size,
                max_tx_size,
                max_block_header_size,
                key_deposit,
                pool_deposit,
                max_epoch,
                n_opt,
                pool_pledge_influence,
                expansion_rate,
                treasury_growth_rate,
                d,
                extra_entropy,
                protocol_version,
                min_pool_cost,
                ada_per_utxo_byte,
                cost_models,
                execution_costs,
                max_tx_ex_units,
                max_block_ex_units,
                max_value_size,
                collateral_percentage,
                max_collateral_inputs,
                // Conway
                pool_voting_thresholds,
                drep_voting_thresholds,
                min_committee_size,
                committee_term_limit,
                governance_action_expiration,
                governance_action_deposit,
                drep_deposit,
                drep_inactivity_period,
            })
        })()
        .map_err(|e| e.annotate("ProtocolParamUpdate"))
    }
}

impl cbor_event::se::Serialize for TransactionBodies {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for TransactionBodies {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(TransactionBody::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("TransactionBodies"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for TransactionWitnessSets {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for TransactionWitnessSets {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(TransactionWitnessSet::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("TransactionWitnessSets"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for TransactionIndexes {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for TransactionIndexes {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(TransactionIndex::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("TransactionIndexes"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for AuxiliaryDataSet {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(self.0.len() as u64))?;
        for (key, value) in &self.0 {
            key.serialize(serializer)?;
            value.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for AuxiliaryDataSet {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut table = linked_hash_map::LinkedHashMap::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            while match len {
                cbor_event::Len::Len(n) => table.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                let key = TransactionIndex::deserialize(raw)?;
                let value = AuxiliaryData::deserialize(raw)?;
                if table.insert(key.clone(), value).is_some() {
                    return Err(DeserializeFailure::DuplicateKey(Key::Str(String::from(
                        "some complicated/unsupported type",
                    )))
                    .into());
                }
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("AuxiliaryDataSet"))?;
        Ok(Self(table))
    }
}

impl cbor_event::se::Serialize for Block {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(5))?;
        self.header.serialize(serializer)?;
        self.transaction_bodies.serialize(serializer)?;
        self.transaction_witness_sets.serialize(serializer)?;
        self.auxiliary_data_set.serialize(serializer)?;
        serializer.write_array(cbor_event::Len::Len(self.invalid_transactions.len() as u64))?;
        for element in self.invalid_transactions.0.iter() {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for Block {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(4)?;
            let header = (|| -> Result<_, DeserializeError> { Ok(Header::deserialize(raw)?) })()
                .map_err(|e| e.annotate("header"))?;
            let transaction_bodies =
                (|| -> Result<_, DeserializeError> { Ok(TransactionBodies::deserialize(raw)?) })()
                    .map_err(|e| e.annotate("transaction_bodies"))?;
            let transaction_witness_sets = (|| -> Result<_, DeserializeError> {
                Ok(TransactionWitnessSets::deserialize(raw)?)
            })()
            .map_err(|e| e.annotate("transaction_witness_sets"))?;
            let auxiliary_data_set =
                (|| -> Result<_, DeserializeError> { Ok(AuxiliaryDataSet::deserialize(raw)?) })()
                    .map_err(|e| e.annotate("auxiliary_data_set"))?;
            let invalid_present = match len {
                cbor_event::Len::Indefinite => raw.cbor_type()? == CBORType::Array,
                cbor_event::Len::Len(4) => false,
                _ => true,
            };
            let invalid_transactions = (|| -> Result<_, DeserializeError> {
                let mut arr = Vec::new();
                if invalid_present {
                    read_len.read_elems(1)?;
                    let len = raw.array()?;
                    while match len {
                        cbor_event::Len::Len(n) => arr.len() < n as usize,
                        cbor_event::Len::Indefinite => true,
                    } {
                        if raw.cbor_type()? == CBORType::Special {
                            assert_eq!(raw.special()?, CBORSpecial::Break);
                            break;
                        }
                        arr.push(TransactionIndex::deserialize(raw)?);
                    }
                }
                Ok(arr)
            })()
            .map_err(|e| e.annotate("invalid_transactions"))?;
            match len {
                cbor_event::Len::Len(_) => (),
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            Ok(Block {
                header,
                transaction_bodies,
                transaction_witness_sets,
                auxiliary_data_set,
                invalid_transactions: TransactionIndexes(invalid_transactions),
            })
        })()
        .map_err(|e| e.annotate("Block"))
    }
}

impl cbor_event::se::Serialize for Header {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.header_body.serialize(serializer)?;
        self.body_signature.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for Header {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("Header"))
    }
}

impl DeserializeEmbeddedGroup for Header {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let header_body =
            (|| -> Result<_, DeserializeError> { Ok(HeaderBody::deserialize(raw)?) })()
                .map_err(|e| e.annotate("header_body"))?;
        let body_signature =
            (|| -> Result<_, DeserializeError> { Ok(KESSignature::deserialize(raw)?) })()
                .map_err(|e| e.annotate("body_signature"))?;
        Ok(Header {
            header_body,
            body_signature,
        })
    }
}

impl cbor_event::se::Serialize for OperationalCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.serialize_as_embedded_group(serializer)
    }
}

impl SerializeEmbeddedGroup for OperationalCert {
    fn serialize_as_embedded_group<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        self.hot_vkey.serialize(serializer)?;
        self.sequence_number.serialize(serializer)?;
        self.kes_period.serialize(serializer)?;
        self.sigma.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for OperationalCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("OperationalCert"))
    }
}

impl DeserializeEmbeddedGroup for OperationalCert {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let hot_vkey = (|| -> Result<_, DeserializeError> { Ok(KESVKey::deserialize(raw)?) })()
            .map_err(|e| e.annotate("hot_vkey"))?;
        let sequence_number = (|| -> Result<_, DeserializeError> { Ok(u32::deserialize(raw)?) })()
            .map_err(|e| e.annotate("sequence_number"))?;
        let kes_period = (|| -> Result<_, DeserializeError> { Ok(u32::deserialize(raw)?) })()
            .map_err(|e| e.annotate("kes_period"))?;
        let sigma =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519Signature::deserialize(raw)?) })()
                .map_err(|e| e.annotate("sigma"))?;
        Ok(OperationalCert {
            hot_vkey,
            sequence_number,
            kes_period,
            sigma,
        })
    }
}

impl cbor_event::se::Serialize for HeaderBody {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(15))?;
        self.block_number.serialize(serializer)?;
        self.slot.serialize(serializer)?;
        match &self.prev_hash {
            Some(x) => x.serialize(serializer),
            None => serializer.write_special(CBORSpecial::Null),
        }?;
        self.issuer_vkey.serialize(serializer)?;
        self.vrf_vkey.serialize(serializer)?;
        self.nonce_vrf.serialize(serializer)?;
        self.leader_vrf.serialize(serializer)?;
        self.block_body_size.serialize(serializer)?;
        self.block_body_hash.serialize(serializer)?;
        self.operational_cert
            .serialize_as_embedded_group(serializer)?;
        self.protocol_version
            .serialize_as_embedded_group(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for HeaderBody {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("HeaderBody"))
    }
}

impl DeserializeEmbeddedGroup for HeaderBody {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        len: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let block_number = (|| -> Result<_, DeserializeError> { Ok(u32::deserialize(raw)?) })()
            .map_err(|e| e.annotate("block_number"))?;
        let slot = (|| -> Result<_, DeserializeError> { Ok(Slot::deserialize(raw)?) })()
            .map_err(|e| e.annotate("slot"))?;
        let prev_hash = (|| -> Result<_, DeserializeError> {
            Ok(match raw.cbor_type()? != CBORType::Special {
                true => Some(BlockHash::deserialize(raw)?),
                false => {
                    if raw.special()? != CBORSpecial::Null {
                        return Err(DeserializeFailure::ExpectedNull.into());
                    }
                    None
                }
            })
        })()
        .map_err(|e| e.annotate("prev_hash"))?;
        let issuer_vkey = (|| -> Result<_, DeserializeError> { Ok(Vkey::deserialize(raw)?) })()
            .map_err(|e| e.annotate("issuer_vkey"))?;
        let vrf_vkey = (|| -> Result<_, DeserializeError> { Ok(VRFVKey::deserialize(raw)?) })()
            .map_err(|e| e.annotate("vrf_vkey"))?;
        let nonce_vrf = (|| -> Result<_, DeserializeError> { Ok(VRFCert::deserialize(raw)?) })()
            .map_err(|e| e.annotate("nonce_vrf"))?;
        let leader_vrf = (|| -> Result<_, DeserializeError> { Ok(VRFCert::deserialize(raw)?) })()
            .map_err(|e| e.annotate("leader_vrf"))?;
        let block_body_size = (|| -> Result<_, DeserializeError> { Ok(u32::deserialize(raw)?) })()
            .map_err(|e| e.annotate("block_body_size"))?;
        let block_body_hash =
            (|| -> Result<_, DeserializeError> { Ok(BlockHash::deserialize(raw)?) })()
                .map_err(|e| e.annotate("block_body_hash"))?;
        let operational_cert = (|| -> Result<_, DeserializeError> {
            Ok(OperationalCert::deserialize_as_embedded_group(raw, len)?)
        })()
        .map_err(|e| e.annotate("operational_cert"))?;
        let protocol_version = (|| -> Result<_, DeserializeError> {
            Ok(ProtocolVersion::deserialize_as_embedded_group(raw, len)?)
        })()
        .map_err(|e| e.annotate("protocol_version"))?;
        Ok(HeaderBody {
            block_number,
            slot,
            prev_hash,
            issuer_vkey,
            vrf_vkey,
            nonce_vrf,
            leader_vrf,
            block_body_size,
            block_body_hash,
            operational_cert,
            protocol_version,
        })
    }
}

impl cbor_event::se::Serialize for AssetName {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_bytes(&self.0)
    }
}

impl Deserialize for AssetName {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Self::new_impl(raw.bytes()?)
    }
}

impl cbor_event::se::Serialize for AssetNames {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for AssetNames {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(AssetName::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("AssetNames"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for Assets {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(self.0.len() as u64))?;
        for (key, value) in &self.0 {
            key.serialize(serializer)?;
            value.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for Assets {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut table = std::collections::BTreeMap::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            while match len {
                cbor_event::Len::Len(n) => table.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                let key = AssetName::deserialize(raw)?;
                let value = BigNum::deserialize(raw)?;
                if table.insert(key.clone(), value).is_some() {
                    return Err(DeserializeFailure::DuplicateKey(Key::Str(String::from(
                        "some complicated/unsupported type",
                    )))
                    .into());
                }
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("Assets"))?;
        Ok(Self(table))
    }
}

impl cbor_event::se::Serialize for MultiAsset {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(self.0.len() as u64))?;
        for (key, value) in &self.0 {
            key.serialize(serializer)?;
            value.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for MultiAsset {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut table = std::collections::BTreeMap::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            while match len {
                cbor_event::Len::Len(n) => table.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                let key = PolicyID::deserialize(raw)?;
                let value = Assets::deserialize(raw)?;
                if table.insert(key.clone(), value).is_some() {
                    return Err(DeserializeFailure::DuplicateKey(Key::Str(String::from(
                        "some complicated/unsupported type",
                    )))
                    .into());
                }
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("MultiAsset"))?;
        Ok(Self(table))
    }
}

impl cbor_event::se::Serialize for MintAssets {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(self.0.len() as u64))?;
        for (key, value) in &self.0 {
            key.serialize(serializer)?;
            value.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for MintAssets {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut table = std::collections::BTreeMap::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            while match len {
                cbor_event::Len::Len(n) => table.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                let key = AssetName::deserialize(raw)?;
                let value = Int::deserialize(raw)?;
                if table.insert(key.clone(), value).is_some() {
                    return Err(DeserializeFailure::DuplicateKey(Key::Str(String::from(
                        "some complicated/unsupported type",
                    )))
                    .into());
                }
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("MintAssets"))?;
        Ok(Self(table))
    }
}

impl cbor_event::se::Serialize for Mint {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(self.0.len() as u64))?;
        for (key, value) in &self.0 {
            key.serialize(serializer)?;
            value.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for Mint {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut table = std::collections::BTreeMap::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            while match len {
                cbor_event::Len::Len(n) => table.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                let key = PolicyID::deserialize(raw)?;
                let value = MintAssets::deserialize(raw)?;
                if table.insert(key.clone(), value).is_some() {
                    return Err(DeserializeFailure::DuplicateKey(Key::Str(String::from(
                        "some complicated/unsupported type",
                    )))
                    .into());
                }
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("Mint"))?;
        Ok(Self(table))
    }
}

impl cbor_event::se::Serialize for NetworkId {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        match self.0 {
            NetworkIdKind::Testnet => serializer.write_unsigned_integer(0u64),
            NetworkIdKind::Mainnet => serializer.write_unsigned_integer(1u64),
        }
    }
}

impl Deserialize for NetworkId {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            match raw.unsigned_integer()? {
                0 => Ok(NetworkId::testnet()),
                1 => Ok(NetworkId::mainnet()),
                _ => Err(DeserializeError::new(
                    "NetworkId",
                    DeserializeFailure::NoVariantMatched.into(),
                )),
            }
        })()
        .map_err(|e| e.annotate("NetworkId"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tx_output_deser() {
        let mut txos = TransactionOutputs::new();
        let addr = Address::from_bech32("addr1qyxwnq9kylzrtqprmyu35qt8gwylk3eemq53kqd38m9kyduv2q928esxmrz4y5e78cvp0nffhxklfxsqy3vdjn3nty9s8zygkm").unwrap();
        let val = &Value::new(&BigNum::from_str("435464757").unwrap());
        let txo = TransactionOutput {
            format: 0,
            address: addr.clone(),
            amount: val.clone(),
            datum: None,
            script_ref: None,
        };
        let mut txo_dh = txo.clone();
        txo_dh.set_datum(&Datum::new_data_hash(&DataHash::from(
            [47u8; DataHash::BYTE_COUNT],
        )));
        txos.add(&txo);
        txos.add(&txo_dh);
        txos.add(&txo_dh);
        txos.add(&txo);
        txos.add(&txo);
        txos.add(&txo_dh);
        let bytes = txos.to_bytes();
        let txos_deser = TransactionOutputs::from_bytes(bytes.clone()).unwrap();
        let bytes_deser = txos_deser.to_bytes();
        assert_eq!(bytes, bytes_deser);
    }

    #[test]
    fn mir_deser() {
        let reserves_to_pot = MoveInstantaneousReward::new_to_other_pot(
            MIRPot::Treasury,
            &Coin::from_str("143546464").unwrap(),
        );
        let reserves_to_pot_deser =
            MoveInstantaneousReward::from_bytes(reserves_to_pot.to_bytes()).unwrap();
        assert_eq!(reserves_to_pot.to_bytes(), reserves_to_pot_deser.to_bytes());
        let treasury_to_pot = MoveInstantaneousReward::new_to_other_pot(
            MIRPot::Treasury,
            &Coin::from_str("0").unwrap(),
        );
        let treasury_to_pot_deser =
            MoveInstantaneousReward::from_bytes(treasury_to_pot.to_bytes()).unwrap();
        assert_eq!(treasury_to_pot.to_bytes(), treasury_to_pot_deser.to_bytes());
        let mut stake_creds = MIRToStakeCredentials::new();
        stake_creds.insert(
            &StakeCredential::from_scripthash(&ScriptHash([54u8; ScriptHash::BYTE_COUNT])),
            &Int::new_i32(-314159265),
        );
        let to_stake_creds =
            MoveInstantaneousReward::new_to_stake_creds(MIRPot::Treasury, &stake_creds);
        let to_stake_creds_deser =
            MoveInstantaneousReward::from_bytes(to_stake_creds.to_bytes()).unwrap();
        assert_eq!(to_stake_creds.to_bytes(), to_stake_creds_deser.to_bytes());
    }

    #[test]
    #[ignore]
    fn alonzo_block() {
        // this test for some reason has 2-byte pool metadata hashes so don't run this without changing that
        let bytes = hex::decode("85828f03095820bb30a42c1e62f0afda5f0a4e8a562f7a13a24cea00ee81917b86b89e801314aa58208a88e3dd7409f195fd52db2d3cba5d72ca6709bf1d94121bf3748801b40f6f5c58208a88e3dd7409f195fd52db2d3cba5d72ca6709bf1d94121bf3748801b40f6f5c8258404fefc7c718693b57c87170ceba220382afbdd148c0a53b4a009ca63ad1f101483a6170c83a77f23d362a68dcb502802df7f98fa4f7a78b4082b211530e1234305850f770f6769ae9871d42b970fc6254bb927c2181fff45897f241bd72221d86d33c8df64c0a3c8cbb9aa52fef191d7202465c52df8d33727a38c7dc5d40864d753348a340f8afcbb3bb05d4a03f16b1080d825840fe682775f0fa232e909ddc9ec3210ea7a0ee6514cd8b0815190a08f7cef3985463152e10dfad9ed6c09b641b6c1824498e77814a7c12e03096a63cd62056446358500951ed3ef2065e4196d008b50a63bb3e2bdc9a64df67eff4e230b35429291def476684114e074357a5c834bf79eacf583b6fe9fcd1d17f3719a31de97aa4da5e4630b05421359e0b6e4a9bd76c6b920b190929582010c865acec05c84c2c0d0b889f7dbe9bf3b5561f8552da1eb286eac4ccdabc5e5820d298da3803eb9958f01c02e73f2410f2f9bb2ecbc346526b1b76772e1bdd7db500005840940f8a3696847e4a238705bdd27a345086282067b9bc5cb7b69847ca8756085844d576f59ab056c169a504320cc1eab4c11fd529482b3c57da6fa96d44635b0802005901c0a1b2ee63b357fe0b19c6bb8dc3fc865c0608a89626505c5f9aff3b74a0809ca2635e0c4235c247306987c7fd76a4a06210ebf74178e72a1faa78fb8865a69005cc6a5ab5c9b40f817c715df558af7d07b6186f0ccf31715ec2fb00980730ac166af657e6670608afe1bf651d496e01b1c7ff1eb44614d8cfd1b7e32b2c2939349236cc0ada145d8d8d7ad919ef1e60c8bbad31dbedf9f395849705a00c14a8785106aae31f55abc5b1f2089cbef16d9401f158704c1e4f740f7125cfc700a99d97d0332eacb33e4bbc8dab2872ec2b3df9e113addaebd156bfc64fdfc732614d2aedd10a58a34993b7b08c822af3aa615b6bbb9b267bc902e4f1075e194aed084ca18f8bcde1a6b094bf3f5295a0d454c0a083ed5b74f7092fc0a7346c03979a30eeea76d686e512ba48d21544ba874886cdd166cbf275b11f1f3881f4c4277c09a24b88fc6168f4578267bdc9d62cb9b78b8dfc888ccce226a177725f39e7d50930552861d1e88b7898971c780dc3b773321ba1854422b5cecead7d50e77783050eeae2cd9595b9cd91681c72e5d53bb7d12f28dec9b2847ee70a3d7781fb1133aea3b169f536ff5945ec0a76950e51beded0627bb78120617a2f0842e50e3981ae0081825820ee155ace9c40292074cb6aff8c9ccdd273c81648ff1149ef36bcea6ebb8a3e25000d81825820bb30a42c1e62f0afda5f0a4e8a562f7a13a24cea00ee81917b86b89e801314aa01018183583900cb9358529df4729c3246a2a033cb9821abbfd16de4888005904abc410d6a577e9441ad8ed9663931906e4d43ece8f82c712b1d0235affb06821864a1581ca646474b8f5431261506b6c273d307c7569a4eb6c96b42dd4a29520aa14a636f75747473436f696e1903e85820ee155ace9c40292074cb6aff8c9ccdd273c81648ff1149ef36bcea6ebb8a3e25021903e70304048382008200581c0d6a577e9441ad8ed9663931906e4d43ece8f82c712b1d0235affb068a03581c0d6a577e9441ad8ed9663931906e4d43ece8f82c712b1d0235affb065820c5e21ab1c9f6022d81c3b25e3436cb7f1df77f9652ae3e1310c28e621dd87b4c0105d81e82010a581de00d6a577e9441ad8ed9663931906e4d43ece8f82c712b1d0235affb0681581c0d6a577e9441ad8ed9663931906e4d43ece8f82c712b1d0235affb0680826e636f6e73656e7375732e706f6f6c427b7d82068200a18200581c008b47844d92812fc30d1f0ac9b6fbf38778ccba9db8312ad9079079186e05a1581de00d6a577e9441ad8ed9663931906e4d43ece8f82c712b1d0235affb0618640682a1581ce0a714319812c3f773ba04ec5d6b3ffcd5aad85006805b047b082541a104190fa00008020e81581cf81ce66e0f52da5ca48193386e7511fde5b030a307b4c3681736c6f009a1581cb16b56f5ec064be6ac3cab6035efae86b366cc3dc4a0d571603d70e5a14a636f75747473436f696e1903e80b58209e1199a988ba72ffd6e9c269cadb3b53b5f360ff99f112d9b2ee30c4d74ad88b0758209e1199a988ba72ffd6e9c269cadb3b53b5f360ff99f112d9b2ee30c4d74ad88b0f0181a400818258203b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da295840815671b581b4b02a30108a799a85c7f2e5487fb667e748e8fde59e466ab987ce133ecb77ffa0dc53c5804e6706e26b94e17803235da28112bc747de48ccbd70903814c4b0100002002002002000011048118bf058184000019039782191388191388a100d90103a300a40166737472696e67024562797465730382010204a10341620181820180028148470100002002006180").unwrap();
        let block = Block::from_bytes(bytes).unwrap();
        let block2 = Block::from_bytes(block.to_bytes()).unwrap();
        assert_eq!(block.to_bytes(), block2.to_bytes());
    }

    #[test]
    fn pre_alonzo_block() {
        let bytes = hex::decode("84828f1a002072a81a00ca44f0582070d6f38b4569ba062c09632127db13474f22c534e6d8097895403c431e57f12358204f4d7523e41e058a6cbdefb5538654ffc2a53416a7f5bb99f7eac699d42d5c1f58205e3d96cb8ef0291d2f1df6aa7b5a4496ac8de1dcce100c31274325625102796d82584065417914ca323d842c5861407a638e146e6af55f59aff95f1451839de2aa709151237e24e6db7bf94db97293da9c1e61e68d60c8e2b10a116d3c71067247458b5850dc36a5a88f09f0b7a0b5d5d52d87c7c3e3c20752176a426d182255df3d026392f407990f09e5858de6432263fc167bc890a97d07d2371cd5bb26b12242c1ff6fda184ec78d15493a38a3e0df1494f800825840df4e07d3bca43341e4297e2914ea38363ecea1c17ce9145294c4631e0f09f706cb23a5f27c6b71ae9ac46a7ca25af4d7c156f15444fa41814f7d6a0b6a4e57525850d6073f277ded1ef9e8bfe9f6325858c142fbbbbff4395c45d82f0861a6ef6116204965f807e8650fa4e9ac4aa04aeb03984ea66abb129155a78931d39bbcb7ad64afef3f4f55cfa4eb6c97698e88f1051905db5820c1b1fbd809dc06e0e2dc544312aae2a46c059249f86c24ea0689a0b0944a75f558207ce5ce3992b23cb2bf566c48aba8bfc39eb24c9b43354de0129b81bf9f1414b307186058403ac64d720227c18139132b499046a168eb1c5bdd3983385e3518f33fc7f52fd0be348fe3e14d17e1ba606708c30bda061cf23ea3294b0089d3e1e1d58a7aa50702005901c074d3c2c0b5e17b12ba829017186daa1f7f365bbe5b0e0c038cb0cc05e849f702afd349234353ee3cc8878fa31299e85562f04d3cdd74e1bc73591be48d2fbc0d043f6b41fa527b2f9fb3f77605eee528926e76cc18a1638283e5591170f7073462441d40d7cc2e13a38e7d247928cb15d2e5b2e74a12d07f858f7e922bbff8a91c16e9bb8f5ea101c50d96627fb48a03d8191b5035b5de00b9824867fdffb5a2493799e94676bf685db85517dd8a87a0ba2589b3a8a69d529ae8052680c520c5577adbb91cf931e906b1629e621d5bd5c30eaee77f35c5f0a714827b48afaa4e549c1756e94291f4b083aad9c375caf9a67aeac08f32c91cd0572192267960cd74a85148b5e99d0053804dcfb44785417725c56e0fc5caf2ae50fbf25b92c7b7ebe17aa9e289470041a06fd8986f6f9ebdb12e87a970f1d388963929367013e17513e83cab8c98460cab703d5fdd26eeb079e4db701996f73c694365080236901289c5fc96471e91fb75e0e58560f5d073c3ef79a8f5dd4b45ff7abf9c7d7564232f7897ca3d85ac7bb9ecaa75b7c062f27de8b20f301e5607563b2c904e3c7f113b1eeba8a4d1c82fc1a747c920bac6af9a9f4dae1744847232ea03289e25e482a50082825820478ad95cafe9b1660809d618870c86dda1295764e113886e2b8a1de2de5af17201825820f84508cc7674b663db84ceb9f0790f5527f3c70f2a05e4d7f783cd9890463b4e01018182583900ff7f04abbd3050c0b138c8fa3005d48aaf8b9700d4565758e91a95385667fab107f848cfd4b73a7407a7661600cf68f0efc969ece37665ae1a000f4240021a000f4240031a00ca60f1075820e845fe9180ac36cc0102f892a839ad1ed2ea9a52c605fb8e4e1c2774ef0bb65ba50081825820c4b5ad6873b8581c75b8ee52f58a3eded29acbbb92d874a64228a1ca4e68956700018182581d60daad04ed2b7f69e2a9be582e37091739fa036a14c1c22f88061d43c71b004aca96b58fd90c021a000f4240031a00d986900682a7581c0d06d2547ed371fdf95fb5c4c735eecdd53e6a5bb831561bd0fcfd3da10e820300581c2f56e87d67b8e5216582cfeb95dbdc9083110a3ef68faaa51bef3a80a10e820300581c2fca486b4d8f1a0432f5bf18ef473ee4294c795a1a32e3132bc6b90fa10e820300581c4ee98623920698b77c1c7f77288cbdac5f9011ff8970b1f507567d0da10e820300581c514e81afb082fce01678809eebd90eda4f7918354ec7d0433ad16274a10e820300581c581e23030b6038bae716e5d64b9e053db10541b12e6b0b4eff485454a10e820300581ce5f27655371b54aed91cc916b2569060978be80056768fee2cc5ce1ba10e820300186582a1008182582028364596385174f5eabc763031b8d54b18ed5d06967ff44b3abbdbaca9cb58a75840de49197fed8dd13716c88e68452fb314d418a24fee9cc194308bd47b057d161ae40cd8f49bf6b378e7343ee5d3a7b9bdb1f2e9efeef896adaa9eb7373fbb8502a1008882582032a954b521c0b19514408965831ef6839637de7a1a6168bcf8455c504ba93b9c5840ab2d59239499807e25dc8025940a70cb890a52e8f47f35004cfec623036ca9f5c3e925b32bd23a7d1d044cef915913e853dbb57438f9c92a5d5f9581caa67d098258207ec249d890d0aaf9a81207960c163ae2d6ac5e715ca6b96d5860e50d9f2b2b2a5840f2d8031ac5d79777076dd1176cb7ed91690fcfb6be498320e5de9afbf6ea8e8ced23bff69230d050523a4a7e03c2b0599e18e93b31959063249fb50274a02a068258204f4d7523e41e058a6cbdefb5538654ffc2a53416a7f5bb99f7eac699d42d5c1f5840c5844b849865fed81f67842a4697c3090cf4ecb50510f1e6b379b7c63b78417ca28ea653c016d2e733877e1605e8a1712c42404ca0686f67455c620431d54b07825820e764b0340d7b353f5f745891033774e4beab6aa1458a54ff29a1324c05bb9876584026c35f8ec2102ec8fcc3bd0a1a0760486952e147f44236a35c7d818a7024590e1395f097a0d046085ded24ec8c585008d3ffc0321ad040649ce08eb33614760e82582073ae41eca2be37fc15c55a50d668c8647e10bf222172c2d58abfa6e9310e596258402c3f197360294781841f0669822b0449515a5e0b77b23185652a1b0ea8354537b3e9335577a87fa19e9fe47f1039fa286aaa11859d631f3ff74564c6da14c806825820234fb2b8530114b461c6ca8242c8b86a226c95c4c27479ca850d1aea4a52d2985840ba751817e70695a041a5f455c08947fa4e3d6ffc332adeb25691fac4927bbaafd4b3f5f9855946ad9681083aec277766c7f90da7543e912f46aeae07fdd5b90a825820dfb615a61568d6867f45a85c32227f27025180d738a8a3d7fd3c929f624d72395840cc1f728cce6ce2fec21d2648011c14d244c35ba3cbd553593655f6f07d86b8bdf103d52b61143bc1701319517d4a24b778c02e983e02a0f3fd0cd558d472f009825820e5bc21a83616bcccfe343ec36b9dc4c06c90e913df1d8a0b046008651f42caa95840f85bc5e753beed04b3f9072da7a6adadcdb87769528c59e16162e86782b6ce11feacbd5de97e352121e9509a809f613d5bcebf7413fd55f89776c5606e4a9408a100a119534da261638158220a201f79b4d15fd971297a842ac6a4e953b82886df66c0d9723f5870e5725da6380b617601").unwrap();
        let _block = Block::from_bytes(bytes).unwrap();
    }
}
