import React from 'react';
import {
  Box,
  Text,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  OrderedList,
  ListItem,
  Link,
} from '@chakra-ui/react';
import { Scrollbars } from './scrollbar';
import { useCaptureEvent } from '../../../features/analytics/hooks';
import { Events } from '../../../features/analytics/events';

const TermsOfUse = React.forwardRef((props, ref) => {
  const capture = useCaptureEvent();
  const { isOpen, onOpen, onClose } = useDisclosure();
  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
    closeModal() {
      onClose();
    },
  }));
  return (
    <Modal
      size="xs"
      isOpen={isOpen}
      onClose={() => {
        capture(Events.SettingsTermsAndConditionsXClick);
        onClose();
      }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader fontSize="md">Terms of use</ModalHeader>

        <ModalBody pr="0.5">
          <Scrollbars style={{ width: '100%', height: '400px' }}>
            <Box width="92%">
              <Text mb="3">Last Updated: March 30, 2022</Text>
              <Text mb="3">
                These Terms of Use (
                <Text display="inline" fontWeight="bold">
                  "Terms"
                </Text>
                ) set forth the binding legal agreement between you and Input
                Output Global, Inc. (together with our subsidiaries and
                affiliates, referred to as{' '}
                <Text display="inline" fontWeight="bold">
                  "IOG,"
                </Text>{' '}
                <Text display="inline" fontWeight="bold">
                  "we,"
                </Text>{' '}
                or{' '}
                <Text display="inline" fontWeight="bold">
                  "us"
                </Text>{' '}
                in this Agreement). These Terms govern your use of this website
                and all of the related websites, mobile apps, products and
                services offered by IOG and its affiliated entities including
                our plug-ins and browser extensions (collectively, the{' '}
                <Text display="inline" fontWeight="bold">
                  "Products"
                </Text>
                ).
              </Text>
              <Text mb="4">
                We encourage you to review these Terms carefully. By accessing
                or using the Products in any way, including browsing any
                IOG-owned website, you are agreeing to these Terms in their
                entirety. If you do not agree to any of the Terms, you may not
                use the Products.
              </Text>
              <Text fontWeight="bold">1. Using the Products.</Text>
              <OrderedList mb="3" pl="2" listStyleType="lower-alpha">
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Who can use the Products.
                  </Text>{' '}
                  You must be at least the age of majority in the jurisdiction
                  where you live to use the Products.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Product Changes.
                  </Text>{' '}
                  We reserve the right to make changes or updates to Products,
                  including content and formatting, at any time without notice.
                  We reserve the right to terminate or restrict access to the
                  Products (including any accounts you may have created through
                  your use of the Products) for any reason whatsoever at our
                  sole discretion.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Privacy Policy.
                  </Text>{' '}
                  Our privacy practices are set forth in our{' '}
                  <Link
                    color="teal"
                    isExternal
                    textDecoration="underline"
                    onClick={() =>
                      window.open(
                        'https://static.iohk.io/terms/iog-privacy-policy.pdf'
                      )
                    }
                  >
                    Privacy Policy
                  </Link>
                  . By using the Products in any way, you understand and
                  acknowledge that the terms of the Privacy Policy apply to you.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Additional Terms.
                  </Text>{' '}
                  Specific terms and conditions may apply to specific content,
                  products, materials, services or information contained on or
                  available through various Products or transactions concluded
                  through the Products. Such specific terms may be in addition
                  to these Terms or, where inconsistent with these Terms, only
                  to the extent the content or intent of such specific terms is
                  inconsistent with these Terms, such specific terms will
                  supersede these Terms.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Feedback.
                  </Text>{' '}
                  We welcome your feedback and suggestions about how to improve
                  the Products. Feel free to submit feedback at{' '}
                  <Link
                    isExternal
                    onClick={() => window.open('https://iohk.io/en/contact/')}
                  >
                    https://iohk.io/en/contact/
                  </Link>
                  . By submitting feedback in this or in any other manner to us,
                  you grant us the right, at our discretion, to use, disclose
                  and otherwise exploit the feedback, in whole or part, without
                  any restriction or compensation to you, as further described
                  in Section 2(b) below.
                </ListItem>
              </OrderedList>
              <Text fontWeight="bold">2. Your Content</Text>
              <OrderedList mb="3" pl="2" listStyleType="lower-alpha">
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Definition of Your Content.
                  </Text>{' '}
                  The Products may enable you to post materials, including
                  without limitation photos, profile pictures, messages,
                  comments, and testimonials. You may also post reviews of
                  third-party service providers, third-party products, or
                  third-party services. All materials that you post on the
                  Products will be referred to collectively as{' '}
                  <Text fontWeight="bold" display="inline">
                    "Your Content."
                  </Text>
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    License and Permission to Use Your Content.
                  </Text>{' '}
                  You hereby grant to us and our affiliates, licensees and
                  sublicensees, without compensation to you or others, a
                  nonexclusive, perpetual, irrevocable, royalty-free, fully
                  paid-up, worldwide license (including the right to sublicense
                  through multiple tiers) to use, reproduce, process, adapt,
                  publicly perform, publicly display, modify, prepare derivative
                  works, publish, transmit and distribute Your Content, or any
                  portion thereof, throughout the world in any format, media or
                  distribution method (whether now known or hereafter created)
                  for the duration of any copyright or other rights in Your
                  Content. Such permission will be perpetual and may not be
                  revoked for any reason, to the maximum extent permitted by
                  law. Further, to the extent permitted under applicable law,
                  you waive and release and covenant not to assert any moral
                  rights that you may have in Your Content. If you identify
                  yourself by name or provide a picture or audio or video
                  recording of yourself, you further authorize us and our
                  affiliates, licensees and sublicensees, without compensation
                  to you or others, to reproduce, print, publish and disseminate
                  in any format or media (whether now known or hereafter
                  created) your name, voice and likeness throughout the world,
                  and such permission will be perpetual and cannot be revoked
                  for any reason, except as required by applicable law. You
                  further agree that we may use Your Content in any manner that
                  we deem appropriate or necessary, including but not limited to
                  IOG Business Purposes.{' '}
                  <Text fontWeight="bold" display="inline">
                    "IOG Business Purposes"
                  </Text>{' '}
                  means any use in connection with a Product or IOG cobranded
                  website, application, publication or service, or any use which
                  advertises, markets or promotes Products, the services or the
                  information within the Products, IOG, or its affiliates. IOG
                  Business Purpose specifically includes the use of Your Content
                  within the Products in connection with features and functions
                  offered by IOG to our users that enable them to view and
                  interact with Your Content (such as DApp reviews).
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Ownership.
                  </Text>{' '}
                  We acknowledge and agree that you, or your licensors, as
                  applicable, retain ownership of any and all copyrights in Your
                  Content, subject to the non-exclusive rights granted to us in
                  the paragraph above, and that no ownership of such copyrights
                  is transferred to us under these Terms, except as may
                  otherwise be provided in these Terms or another agreement
                  between you and IOG.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Your Responsibilities for Your Content.
                  </Text>{' '}
                  By posting, uploading, or submitting Your Content to any
                  Products, you represent and warrant to us that you have the
                  ownership rights, or you have obtained all necessary licenses
                  or permissions from any relevant parties, to use Your Content
                  in this manner. This includes obtaining the right to grant us
                  the rights to use Your Content in accordance with these Terms.
                  You are in the best position to judge whether Your Content is
                  in violation of intellectual property or personal rights of
                  any third-party.{' '}
                  <Text fontWeight="bold" display="inline">
                    You accept full responsibility for avoiding infringement of
                    the intellectual property or personal rights of others in
                    connection with Your Content.
                  </Text>{' '}
                  You are responsible for ensuring that Your Content does not
                  violate any applicable law or regulation, including but not
                  limited to the intellectual property rights of any third
                  party. You agree to pay all royalties, fees, and any other
                  monies owed to any person by reason of Your Content.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Limits.
                  </Text>{' '}
                  We reserve the right to remove Your Content, in whole or part,
                  for any reason without notice. We do not guarantee that we
                  will publish any or all of Your Content.
                </ListItem>
              </OrderedList>
              <Text fontWeight="bold">3. Our Content and Materials.</Text>
              <OrderedList mb="3" pl="2" listStyleType="lower-alpha">
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Definition of Our Content and Materials.
                  </Text>{' '}
                  All intellectual property in or related to the Products
                  (specifically including, but not limited to, our software, the
                  IOG marks, the IOG logos) (
                  <Text fontWeight="bold" display="inline">
                    "Our Content and Materials"
                  </Text>
                  ) is the property of IOG.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Our License to You.
                  </Text>{' '}
                  Subject to these Terms of Use, including the restrictions
                  below, we grant you a limited non-exclusive license to use and
                  access Our Content and Materials in connection with your use
                  of the Products. Except as expressly agreed to otherwise by us
                  (such as your entering into another other agreement with us),
                  your use of the Products must be limited to personal,
                  non-commercial use. We may terminate this license at any time
                  for any reason. Except for the rights and license granted in
                  these Terms, we reserve all other rights and grant no other
                  rights or licenses, implied or otherwise. Notwithstanding the
                  foregoing, some content may be subject to open-source
                  licenses, in which case the specific license(s) mentioned in
                  connection with such content shall apply.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Restrictions.
                  </Text>{' '}
                  Except as expressly provided in these Terms, you agree not to
                  use, modify, reproduce, distribute, sell, license, reverse
                  engineer, decompile, or otherwise exploit Our Content and
                  Materials without our express written permission. Your
                  permitted use of the Products expressly excludes commercial
                  use by you of any product descriptions for the benefit of
                  another merchant. You are expressly prohibited from any use of
                  data mining, robots, or similar data gathering and extraction
                  tools in your use of the Products. You may view and print a
                  reasonable number of copies of web pages located on the
                  Products for your own personal use, provided that you retain
                  all proprietary notices contained in the original materials,
                  including attribution to IOG. We have no obligation to delete
                  content that you personally may find objectionable or
                  offensive.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Ownership.
                  </Text>{' '}
                  You acknowledge and agree that the Products and IOG marks will
                  remain the property of IOG. The content, information and
                  services made available on the Products are protected by U.S.
                  and international copyright, trademark, and other laws, and
                  you acknowledge that these rights are valid and enforceable.
                  You acknowledge that you do not acquire any ownership rights
                  by using or interacting with the Products.
                </ListItem>
              </OrderedList>
              <Text fontWeight="bold">4. Other Offerings on the Products.</Text>
              <OrderedList mb="3" pl="2" listStyleType="lower-alpha">
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Third-Party Services.
                  </Text>{' '}
                  Please note that the Products may enable access to third-party
                  content, products, and services, and may offer interactions
                  with third parties that we do not control (collectively{' '}
                  <Text fontWeight="bold" display="inline">
                    "Third-Party Services"
                  </Text>
                  ). The availability of any Third-Party Services on the
                  Products does not imply our endorsement or verification of the
                  Third-Party Services. We assume no responsibility for, nor do
                  we endorse or verify the content, offerings or conduct of
                  third parties (including but not limited to the products or
                  services offered by third parties or the descriptions of the
                  products or services offered by third parties). We make no
                  warranties or representations with respect to the accuracy,
                  completeness or timeliness of any content posted on or in the
                  Products by anyone.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Third-Party Sites.
                  </Text>{' '}
                  The Products may contain links to other websites (the{' '}
                  <Text fontWeight="bold" display="inline">
                    "Third-Party Sites"
                  </Text>
                  ) for your convenience. We do not control the linked websites
                  or the content provided through such Third-Party Sites. Your
                  use of Third-Party Sites is subject to the privacy practices
                  and terms of use established by the specific linked
                  Third-Party Site, and we disclaim all liability for such use.
                  The availability of such links does not indicate any approval
                  or endorsement by us.
                </ListItem>
              </OrderedList>
              <Text fontWeight="bold">
                5. Reporting Violations of Your Intellectual Property Rights.
              </Text>
              <Text mb="3">
                For information about how to submit a request for takedown if
                you believe content on the Products infringes your intellectual
                property rights, please read our{' '}
                <Link
                  color="teal"
                  isExternal
                  textDecoration="underline"
                  onClick={() =>
                    window.open(
                      'https://static.iohk.io/terms/iog-dmca-policy.pdf'
                    )
                  }
                >
                  Digital Millennium Copyright Act (DMCA) Policy
                </Link>
                . We endeavor to respond promptly to requests for content
                removal, consistent with our policies described above and
                applicable law.
              </Text>
              <Text fontWeight="bold">
                6. Disclaimers and Limitations of Liability.
              </Text>
              <Text mb="3" fontWeight="bold">
                PLEASE READ THIS SECTION CAREFULLY SINCE IT LIMITS THE LIABILITY
                OF IOG ENTITIES TO YOU.
              </Text>
              <Text mb="2">
                THE "IOG ENTITIES" MEANS IO GLOBAL, INC., IOG SINGAPORE PTE.
                LTD. AND ANY SUBSIDIARIES, AFFILIATES, RELATED COMPANIES,
                SUPPLIERS, LICENSORS AND PARTNERS, AND THE OFFICERS, DIRECTORS,
                EMPLOYEES, AGENTS AND REPRESENTATIVES OF EACH OF THEM. EACH
                PROVISION BELOW APPLIES TO THE MAXIMUM EXTENT PERMITTED UNDER
                APPLICABLE LAW:
              </Text>
              <OrderedList mb="3" pl="2" listStyleType="lower-alpha">
                <ListItem>
                  WE ARE PROVIDING YOU THE PRODUCTS, SERVICES, INFORMATION, OUR
                  CONTENT AND MATERIALS, PRODUCT DESCRIPTIONS, AND THIRD-PARTY
                  CONTENT ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT
                  WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. WITHOUT LIMITING THE
                  FOREGOING, THE IOG ENTITIES EXPRESSLY DISCLAIM ANY AND ALL
                  WARRANTIES AND CONDITIONS OF MERCHANTABILITY, TITLE, ACCURACY
                  AND COMPLETENESS, UNINTERRUPTED OR ERROR-FREE SERVICE, FITNESS
                  FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT, AND
                  NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF
                  DEALING OR TRADE USAGE. NOTHING CONTAINED IN THE PRODUCTS IS
                  INTENDED TO BE LEGAL, FINANCIAL, OR TAX ADVICE.
                </ListItem>
                <ListItem>
                  THE IOG ENTITIES MAKE NO PROMISES WITH RESPECT TO, AND
                  EXPRESSLY DISCLAIM ALL LIABILITY, TO THE MAXIMUM EXTENT
                  PERMITTED BY LAW, FOR: (i) CONTENT POSTED BY ANY THIRD-PARTY
                  ON THE PRODUCTS, (ii) THE PRODUCT DESCRIPTIONS OR PRODUCTS,
                  (iii) THIRD-PARTY SITES AND ANY THIRD-PARTY PRODUCT OR SERVICE
                  LISTED ON OR ACCESSIBLE TO YOU THROUGH THE IOG PRODUCTS, AND
                  (iv) THE QUALITY OR CONDUCT OF ANY THIRD PARTY YOU ENCOUNTER
                  IN CONNECTION WITH YOUR USE OF THIS WEBSITE OR ANY IOG
                  PRODUCT.
                </ListItem>
                <ListItem>
                  THE IOG ENTITIES DO NOT WARRANT OR MAKE ANY REPRESENTATIONS AS
                  TO THE SECURITY OF ANY OF ITS WEBSITES. YOU ACKNOWLEDGE ANY
                  INFORMATION SENT THROUGH A WEBSITE MAY BE INTERCEPTED. THE IOG
                  ENTITIES DO NOT WARRANT THAT ITS WEBSITES OR THE SERVERS WHICH
                  MAKE THIS WEBSITE AVAILABLE OR ELECTRONIC COMMUNICATIONS SENT
                  BY IOG ENTITIES ARE FREE FROM VIRUSES OR ANY OTHER HARMFUL
                  ELEMENTS. THE IOG ENTITIES DO NOT WARRANT THAT ANY E-MAIL OR
                  OTHER ELECTRONIC CORRESPONDENCE BEING SENT TO IOG WILL BE
                  TIMELY RECEIVED OR PROCESSED. THE IOG ENTITIES SHALL IN NO
                  EVENT BE LIABLE FOR ANY CONSEQUENCES OF NOT TIMELY RECEIVING
                  OR PROCESSING ANY E-MAIL OR OTHER ELECTRONIC CORRESPONDENCE.
                </ListItem>
                <ListItem>
                  YOU AGREE THAT TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE IOG
                  ENTITIES WILL NOT BE LIABLE TO YOU UNDER ANY THEORY OF
                  LIABILITY. WITHOUT LIMITING THE FOREGOING, YOU AGREE THAT THE
                  IOG ENTITIES SPECIFICALLY WILL NOT BE LIABLE FOR (i) ANY
                  INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, INCIDENTAL OR
                  EXEMPLARY DAMAGES, LOSS OF PROFITS, LOSS OF BUSINESS, BUSINESS
                  INTERRUPTION, REPUTATIONAL HARM, OR LOSS OF DATA (EVEN IF THE
                  IOG ENTITIES HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH
                  DAMAGES OR SUCH DAMAGES ARE FORESEEABLE) ARISING OUT OF AND IN
                  ANY WAY CONNECTED WITH YOUR USE OF, OR INABILITY TO USE, THIS
                  WEBSITE OR ANY IOG PRODUCTS OR (ii) ANY AMOUNT, IN THE
                  AGGREGATE, IN EXCESS OF ONE-HUNDRED DOLLARS (USD$100). YOUR
                  USE OF THE PRODUCTS, INFORMATION, OR SERVICES IS AT YOUR SOLE
                  RISK.
                </ListItem>
              </OrderedList>
              <Text fontWeight="bold">7. Indemnification.</Text>
              <Text mb="3">
                You agree to fully indemnify, defend, and hold the IOG Entities
                and their directors, officers, employees, consultants, and other
                representatives, harmless from and against any and all claims,
                damages, losses, costs (including reasonable attorneys' fees),
                and other expenses that arise directly or indirectly out of or
                from: (a) your breach of any part of these Terms, including but
                not limited to any policies referenced herein; (b) any
                allegation that any materials you submit to us or transmit to
                the Products infringe or otherwise violate the copyright,
                patent, trademark, trade secret, or other intellectual property
                or other rights of any third party; (c) your activities in
                connection with the Products or other websites to which the
                Products are linked; and/or (d) your negligent or willful
                misconduct.
              </Text>
              <Text fontWeight="bold">8. Dispute Resolution.</Text>
              <Text mb="3">
                If you have a dispute with IOG, you agree to contact us using
                the form at{' '}
                <Link
                  isExternal
                  onClick={() => window.open('https://iohk.io/en/contact/')}
                >
                  https://iohk.io/en/contact/
                </Link>{' '}
                to attempt to resolve the issue informally first.
              </Text>
              <Text fontWeight="bold">9. Communications.</Text>
              <Text fontWeight="bold" display="inline">
                You are not required to agree to receive promotional text
                messages, calls or prerecorded messages as a condition of using
                the Products.
              </Text>{' '}
              <Text>
                By electing to submit your phone number to us and agreeing to
                these Terms, you agree to receive communications from the IOG
                Entities, including via text messages, calls, pre-recorded
                messages, and push notifications, any of which may be generated
                by automatic telephone dialing systems. These communications
                include, for example, operational communications concerning your
                account or use of the Products, updates concerning new and
                existing features on the Products, communications concerning
                promotions run by us or third parties, and news relating to the
                Products and industry developments. Standard text message
                charges applied by your telephone carrier may apply to text
                messages we send. If you submit someone else's phone number or
                email address to us to receive communications from the IOG
                Entities, you represent and warrant that each person for whom
                you provide a phone number or email address has consented to
                receive communications from IOG.
                <Text fontWeight="bold" mb="3">
                  If you wish to stop receiving promotional emails or
                  promotional text messages, we provide the following methods
                  for you to opt-out or unsubscribe: (a) follow the instructions
                  we provide in the email or initial text message for that
                  category of promotional emails or text messages or (b) if you
                  have an account on the Products, you may opt-out or
                  unsubscribe using your settings.
                </Text>
              </Text>
              <Text fontWeight="bold">10. Miscellaneous.</Text>
              <OrderedList mb="3" pl="2" listStyleType="lower-alpha">
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Application Provider Terms.
                  </Text>{' '}
                  If you access the Products through an IOG application, you
                  acknowledge that these Terms are between you and IOG only, and
                  not with an application service or application platform
                  provider (such as Apple, Inc., or Google Inc.), which may
                  provide you the application subject to its own terms of use.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Controlling Law and Jurisdiction.
                  </Text>{' '}
                  These Terms will be interpreted in accordance with the laws of
                  the State of New York and the United States of America,
                  without regard to their conflict-of-law provisions. You and
                  IOG agree to submit to the personal jurisdiction of a federal
                  or state court located in New York, New York for any actions
                  for which the dispute resolution provision, as set forth in
                  Section 8, does not resolve.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Changes.
                  </Text>{' '}
                  We reserve the right to change the terms of these Terms,
                  consistent with applicable law. You agree that your continued
                  use of the Products after such changes become effective
                  constitutes your acceptance of the changes. If you do not
                  agree with any updates to these Terms, you may not continue to
                  use the Products. Be sure to return to this page periodically
                  to ensure your familiarity with the most current version of
                  the Terms of Use. Any changes to the Terms will be effective
                  on a going forward basis.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Languages.
                  </Text>{' '}
                  The English version of these Terms will be the binding version
                  and all communications, notices, and other actions and
                  proceedings relating to these Terms will be made and conducted
                  in English, even if we choose to provide translations of these
                  Terms into the native languages in certain countries. To the
                  extent allowed by law, any inconsistencies among the different
                  translations will be resolved in favor of the English version.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Assignment.
                  </Text>{' '}
                  No terms of these Terms, nor any right, obligation, or remedy
                  hereunder is assignable, transferable, delegable, or
                  sublicensable by you except with IOG's prior written consent,
                  and any attempted assignment, transfer, delegation, or
                  sublicense shall be null and void. IOG may assign, transfer,
                  or delegate these Terms or any right or obligation or remedy
                  hereunder in its sole discretion.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Waiver.
                  </Text>{' '}
                  Our failure to assert a right or provision under these Terms
                  will not constitute a waiver of such right or provision.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Headings.
                  </Text>{' '}
                  Any heading, caption, or section title contained is inserted
                  only as a matter of convenience and in no way defines or
                  explains any section or provision hereof.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Further Assurances.
                  </Text>{' '}
                  You agree to execute a hard copy of these Terms and any other
                  documents, and take any actions at our expense that we may
                  request to confirm and effect the intent of these Terms and
                  any of your rights or obligations under these Terms.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Entire Agreement and Severability.
                  </Text>{' '}
                  This Agreement supersedes all prior terms, agreements,
                  discussions and writings regarding the Products and
                  constitutes the entire agreement between you and us regarding
                  the Products. If any part of these Terms is found to be
                  unenforceable, then that part will not affect the
                  enforceability of the remaining parts of the Agreement, which
                  will remain in full force and effect.
                </ListItem>
                <ListItem>
                  <Text fontWeight="bold" display="inline">
                    Survival.
                  </Text>{' '}
                  The following provisions will survive expiration or
                  termination of these Terms: Section 2 (Your Content), Section
                  3(c)(Restrictions) and 3(d)(Ownership), Section 6 (Disclaimers
                  and Limitations of Liability), Section 7 (Indemnification),
                  Section 8 (Dispute Resolution) and Section 10 (Miscellaneous).
                </ListItem>
                <ListItem>
                  <Text mb="3">
                    <Text fontWeight="bold" display="inline">
                      Contact.
                    </Text>{' '}
                    Feel free to{' '}
                    <Link
                      color="teal"
                      isExternal
                      textDecoration="underline"
                      onClick={() => window.open('https://iohk.io/en/contact/')}
                    >
                      contact us
                    </Link>{' '}
                    with any questions about these Terms. You can also write to
                    us at:
                  </Text>
                  <Text>Input Output Global, Inc.</Text>
                  <Text>2015 Ionosphere Street, Ste 201</Text>
                  <Text>Longmont, CO 80504</Text>
                  <Text>Attn: Legal</Text>
                </ListItem>
              </OrderedList>
              <Box h="2" />
            </Box>
          </Scrollbars>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default TermsOfUse;
